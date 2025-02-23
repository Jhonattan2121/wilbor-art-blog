'use client';

import { GRID_HOMEPAGE_ENABLED } from '@/app/config';
import { HiveAuth } from '@/auth/hive/HiveAuth';
import { getKeywordsForPhoto, titleForPhoto } from '@/photo';
import PhotoDate from '@/photo/PhotoDate';
import PhotoSmall from '@/photo/PhotoSmall';
import { useAppState } from '@/state/AppState';
import { Tags, addHiddenToTags, formatTag } from '@/tag';
import { formatCount, formatCountDescriptive } from '@/utility/string';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { clsx } from 'clsx/lite';
import { Command } from 'cmdk';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { BiDesktop, BiMoon, BiSun } from 'react-icons/bi';
import { FaTag } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa6';
import { HiDocumentText } from 'react-icons/hi';
import { IoInvertModeSharp } from 'react-icons/io5';
import { RiToolsFill } from 'react-icons/ri';
import { TbPhoto } from 'react-icons/tb';
import { useDebounce } from 'use-debounce';
import { Photo } from '../../../app/grid/types';
import {
  PATH_FEED_INFERRED,
  PATH_GRID_INFERRED,
  PATH_ROOT,
  pathForPhoto,
  pathForTag
} from '../../app/paths';
import Modal from '../Modal';
import Spinner from '../Spinner';
import CommandKItem from './CommandKItem';

const DIALOG_TITLE = 'Global Command-K Menu';
const DIALOG_DESCRIPTION = 'For searching photos, views, and settings';

const LISTENER_KEYDOWN = 'keydown';
const MINIMUM_QUERY_LENGTH = 2;

type CommandKItem = {
  label: ReactNode
  keywords?: string[]
  accessory?: ReactNode
  annotation?: ReactNode
  annotationAria?: string
  path?: string
  action?: () => void | Promise<void>
}

export type CommandKSection = {
  heading: string
  accessory?: ReactNode
  items: CommandKItem[]
}

const renderToggle = (
  label: string,
  onToggle?: Dispatch<SetStateAction<boolean>>,
  isEnabled?: boolean,
): CommandKItem => ({
  label: `Toggle ${label}`,
  action: () => onToggle?.(prev => !prev),
  annotation: isEnabled ? <FaCheck size={12} /> : undefined,
});

export default function CommandKClient({
  tags,
  serverSections = [],
  showDebugTools,
  footer,
}: {
  tags: Tags
  serverSections?: CommandKSection[]
  showDebugTools?: boolean
  footer?: string
}) {
  const pathname = usePathname();

  const {
    isUserSignedIn,
    setUserEmail,
    isCommandKOpen: isOpen,
    hiddenPhotosCount,
    selectedPhotoIds,
    setSelectedPhotoIds,
    insightIndicatorStatus,
    isGridHighDensity,
    areZoomControlsShown,
    arePhotosMatted,
    shouldShowBaselineGrid,
    shouldDebugImageFallbacks,
    shouldDebugInsights,
    setIsCommandKOpen: setIsOpen,
    setShouldRespondToKeyboardCommands,
    setShouldShowBaselineGrid,
    setIsGridHighDensity,
    setAreZoomControlsShown,
    setArePhotosMatted,
    setShouldDebugImageFallbacks,
    setShouldDebugInsights,
  } = useAppState();
  const HIVE_USERNAME = process.env.NEXT_PUBLIC_HIVE_USERNAME || '';

  const isOpenRef = useRef(isOpen);

  const [isPending, startTransition] = useTransition();
  const [keyPending, setKeyPending] = useState<string>();
  const shouldCloseAfterPending = useRef(false);

  useEffect(() => {
    if (!isPending) {
      setKeyPending(undefined);
      if (shouldCloseAfterPending.current) {
        setIsOpen?.(false);
        shouldCloseAfterPending.current = false;
      }
    }
  }, [isPending, setIsOpen]);

  // Raw query values
  const [queryLiveRaw, setQueryLive] = useState('');
  const [queryDebouncedRaw] =
    useDebounce(queryLiveRaw, 500, { trailing: true });
  const isPlaceholderVisible = queryLiveRaw === '';

  // Parameterized query values
  const queryLive = useMemo(() =>
    queryLiveRaw.trim().toLocaleLowerCase(), [queryLiveRaw]);
  const queryDebounced = useMemo(() =>
    queryDebouncedRaw.trim().toLocaleLowerCase(), [queryDebouncedRaw]);

  const [isLoading, setIsLoading] = useState(false);
  const [queriedSections, setQueriedSections] = useState<CommandKSection[]>([]);

  const { setTheme } = useTheme();

  const router = useRouter();

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen?.((open) => !open);
      }
    };
    document.addEventListener(LISTENER_KEYDOWN, down);
    return () => document.removeEventListener(LISTENER_KEYDOWN, down);
  }, [setIsOpen]);

  // Adicione um estado para as tags do Hive
  const [hiveTags, setHiveTags] = useState<{ tag: string, count: number }[]>([]);

  // Adicione um useEffect para carregar as tags do Hive
  useEffect(() => {
    const loadHiveTags = async () => {
      try {
        const hiveAuth = new HiveAuth();
        const posts = await hiveAuth.getUserPosts(HIVE_USERNAME,
           100);

        const tagsCount = new Map<string, number>();

        posts.forEach((post: any) => {
          const json = JSON.parse(post.json_metadata);
          if (json.tags) {
            json.tags.forEach((tag: string) => {
              tagsCount.set(tag, (tagsCount.get(tag) || 0) + 1);
            });
          }
        });

        const formattedTags = Array.from(tagsCount.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);

        setHiveTags(formattedTags);
      } catch (error) {
        console.error('Erro ao carregar tags do Hive:', error);
      }
    };

    loadHiveTags();
  }, []);

  useEffect(() => {
    if (queryDebounced.length >= MINIMUM_QUERY_LENGTH && !isPending) {
      setIsLoading(true);

      // Busca no Hive
      const searchHive = async () => {
        try {
          const hiveAuth = new HiveAuth();
          const posts = await hiveAuth.getUserPosts(HIVE_USERNAME, 100 );

          if (!isOpenRef.current) {
            setQueriedSections([]);
            return;
          }

          const photos: Photo[] = [];
          posts.forEach((post: any) => {
            const json = JSON.parse(post.json_metadata);
            if (json.image) {
              const matchesQuery = post.title.toLowerCase().
                includes(queryDebounced) ||
                (json.tags && json.tags.some((tag: string) => tag.
                  toLowerCase().includes(queryDebounced)));

              if (matchesQuery) {
                json.image.forEach((url: string) => {
                  const now = new Date();
                  photos.push({
                    id: `${post.id}-${url}`,
                    url: url,
                    title: post.title,
                    createdAt: new Date(post.created),
                    updatedAt: new Date(post.last_update),
                    blurData: '',
                    tags: json.tags || [],
                    takenAt: now,
                    takenAtNaive: now.toISOString(),
                    takenAtNaiveFormatted: now.toLocaleDateString(),
                    extension: url.split('.').pop() || '',
                    aspectRatio: 1,
                    camera: null // Adicionando a propriedade obrigatória
                  });
                });
              }
            }
          });

          // Adiciona a seção de fotos do Hive nos resultados
          setQueriedSections(prev => {
            const hiveSections = photos.length > 0 ? [{
              heading: 'Fotos do Hive',
              accessory: <TbPhoto size={14} />,
              items: photos.map(photo => ({
                label: titleForPhoto(photo),
                keywords: getKeywordsForPhoto(photo),
                annotation: <PhotoDate {...{ photo, timezone: undefined }} />,
                accessory: <PhotoSmall photo={photo} />,
                path: pathForPhoto({ photo }),
              })),
            }] : [];

            return [...hiveSections, ...prev];
          });
        } catch (error) {
          console.error('Erro ao buscar no Hive:', error);
        } finally {
          setIsLoading(false);
        }
      };

      // Executa a busca
      searchHive();
    } else if (queryLive === '') {
      setQueriedSections([]);
      setIsLoading(false);
    }
  }, [queryDebounced, isPending, queryLive]);

  useEffect(() => {
    if (queryLive === '') {
      setQueriedSections([]);
      setIsLoading(false);
    } else if (queryLive.length >= MINIMUM_QUERY_LENGTH) {
      setIsLoading(true);
    }
  }, [queryLive]);

  useEffect(() => {
    if (isOpen) {
      setShouldRespondToKeyboardCommands?.(false);
    } else if (!isOpen) {
      setQueryLive('');
      setQueriedSections([]);
      setIsLoading(false);
      setTimeout(() => setShouldRespondToKeyboardCommands?.(true), 500);
    }
  }, [isOpen, setShouldRespondToKeyboardCommands]);

  const tagsIncludingHidden = useMemo(() =>
    addHiddenToTags(tags, hiddenPhotosCount)
    , [tags, hiddenPhotosCount]);

  const SECTION_TAGS: CommandKSection = {
    heading: 'Tags',
    accessory: <FaTag
      size={10}
      className="translate-x-[1px] translate-y-[0.75px]"
    />,
    items: tagsIncludingHidden.map(({ tag, count }) => ({
      label: formatTag(tag),
      annotation: formatCount(count),
      annotationAria: formatCountDescriptive(count),
      path: pathForTag(tag),
    })),
  };

  const clientSections: CommandKSection[] = [{
    heading: 'Theme',
    accessory: <IoInvertModeSharp
      size={14}
      className="translate-y-[0.5px] translate-x-[-1px]"
    />,
    items: [{
      label: 'Use System',
      annotation: <BiDesktop />,
      action: () => setTheme('system'),
    }, {
      label: 'Light Mode',
      annotation: <BiSun size={16} className="translate-x-[1.25px]" />,
      action: () => setTheme('light'),
    }, {
      label: 'Dark Mode',
      annotation: <BiMoon className="translate-x-[1px]" />,
      action: () => setTheme('dark'),
    }],
  }];

  if (isUserSignedIn && showDebugTools) {
    clientSections.push({
      heading: 'Debug Tools',
      accessory: <RiToolsFill size={16} className="translate-x-[-1px]" />,
      items: [
        renderToggle(
          'Zoom Controls',
          setAreZoomControlsShown,
          areZoomControlsShown,
        ),
        renderToggle(
          'Photo Matting',
          setArePhotosMatted,
          arePhotosMatted,
        ),
        renderToggle(
          'High Density Grid',
          setIsGridHighDensity,
          isGridHighDensity,
        ),
        renderToggle(
          'Image Fallbacks',
          setShouldDebugImageFallbacks,
          shouldDebugImageFallbacks,
        ),
        renderToggle(
          'Baseline Grid',
          setShouldShowBaselineGrid,
          shouldShowBaselineGrid,
        ),
        renderToggle(
          'Insights Debugging',
          setShouldDebugInsights,
          shouldDebugInsights,
        ),
      ],
    });
  }

  const pagesItems: CommandKItem[] = [{
    label: 'Home',
    path: PATH_ROOT,
  }];

  if (GRID_HOMEPAGE_ENABLED) {
    pagesItems.push({
      label: 'Feed',
      path: PATH_FEED_INFERRED,
    });
  } else {
    pagesItems.push({
      label: 'Grid',
      path: PATH_GRID_INFERRED,
    });
  }

  const sectionPages: CommandKSection = {
    heading: 'Pages',
    accessory: <HiDocumentText size={15} className="translate-x-[-1px]" />,
    items: pagesItems,
  };

  const hiveSection: CommandKSection = {
    heading: 'Hive Content',
    accessory: <TbPhoto size={14} />,
    items: [{
      label: `Photos from @${HIVE_USERNAME}`,
      path: PATH_GRID_INFERRED,
    }],
  };

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      filter={(value, search, keywords) => {
        const searchFormatted = search.trim().toLocaleLowerCase();
        return (
          value.toLocaleLowerCase().includes(searchFormatted) ||
          keywords?.some(keyword => keyword.includes(searchFormatted))
        ) ? 1 : 0;
      }}
      loop
    >
      <Modal
        anchor='top'
        onClose={() => setIsOpen?.(false)}
        fast
      >
        <div className="space-y-1.5">
          <div className="relative">
            <VisuallyHidden.Root>
              <DialogTitle>{DIALOG_TITLE}</DialogTitle>
              <DialogDescription>{DIALOG_DESCRIPTION}</DialogDescription>
            </VisuallyHidden.Root>
            <Command.Input
              onChangeCapture={(e) => setQueryLive(e.currentTarget.value)}
              className={clsx(
                'w-full min-w-0!',
                'focus:ring-0',
                isPlaceholderVisible || isLoading && 'pr-8!',
                'border-gray-200! dark:border-gray-800!',
                'focus:border-gray-200 dark:focus:border-gray-800',
                'placeholder:text-gray-400/80',
                'dark:placeholder:text-gray-700',
                'focus:outline-hidden',
                isPending && 'opacity-20',
              )}
              placeholder="Search photos, views, settings ..."
              disabled={isPending}
            />
            {isLoading && !isPending &&
              <span className={clsx(
                'absolute top-2.5 right-0 w-8',
                'flex items-center justify-center translate-y-[2px]',
              )}>
                <Spinner size={16} />
              </span>}
          </div>
          <Command.List className={clsx(
            'relative overflow-y-auto',
            'max-h-48 sm:max-h-72',
          )}>
            <Command.Empty className="mt-1 pl-3 text-dim">
              {isLoading ? 'Searching ...' : 'No results found'}
            </Command.Empty>
            {queriedSections
              .concat(SECTION_TAGS)
              .concat(serverSections)
              .concat(sectionPages)
              .concat(hiveSection)
              .concat(clientSections)
              .filter(({ items }) => items.length > 0)
              .map(({ heading, accessory, items }) =>
                <Command.Group
                  key={heading}
                  heading={<div className={clsx(
                    'flex items-center',
                    'px-2',
                    isPending && 'opacity-20',
                  )}>
                    {accessory &&
                      <div className="w-5">{accessory}</div>}
                    {heading}
                  </div>}
                  className={clsx(
                    'uppercase',
                    'select-none',
                    '[&>*:first-child]:py-1',
                    '[&>*:first-child]:font-medium',
                    '[&>*:first-child]:text-dim',
                    '[&>*:first-child]:text-xs',
                    '[&>*:first-child]:tracking-wider',
                  )}
                >
                  {items.map(({
                    label,
                    keywords,
                    accessory,
                    annotation,
                    annotationAria,
                    path,
                    action,
                  }) => {
                    const key = `${heading} ${label}`;
                    return <CommandKItem
                      key={key}
                      label={label}
                      value={key}
                      keywords={keywords}
                      onSelect={() => {
                        if (action) {
                          action();
                          if (!path) { setIsOpen?.(false); }
                        }
                        if (path) {
                          if (path !== pathname) {
                            setKeyPending(key);
                            startTransition(() => {
                              shouldCloseAfterPending.current = true;
                              router.push(path, { scroll: true });
                            });
                          } else {
                            setIsOpen?.(false);
                          }
                        }
                      }}
                      accessory={accessory}
                      annotation={annotation}
                      annotationAria={annotationAria}
                      loading={key === keyPending}
                      disabled={isPending && key !== keyPending}
                    />;
                  })}
                </Command.Group>)}
            {footer && !queryLive &&
              <div className="text-center text-dim pt-3 sm:pt-4">
                {footer}
              </div>}
          </Command.List>
        </div>
      </Modal>
    </Command.Dialog>
  );
}
