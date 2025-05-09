'use server';

import {
  AI_TEXT_AUTO_GENERATED_FIELDS,
  AI_TEXT_GENERATION_ENABLED,
  BLUR_ENABLED,
} from '@/app/config';
import {
  PATH_ADMIN_PHOTOS,
  PATH_ADMIN_TAGS,
  PATH_ROOT,
  pathForPhoto,
} from '@/app/paths';
import { runAuthenticatedAdminServerAction } from '@/auth';
import {
  getPhotosCached,
  getPhotosMetaCached,
  revalidateAdminPaths,
  revalidateAllKeysAndPaths,
  revalidatePhoto,
  revalidatePhotosKey,
  revalidateTagsKey,
} from '@/photo/cache';
import {
  addTagsToPhotos,
  deletePhoto,
  deletePhotoTagGlobally,
  getPhoto,
  getPhotos,
  getUniqueTags,
  insertPhoto,
  renamePhotoTagGlobally,
  updatePhoto,
} from '@/photo/db/query';
import { streamOpenAiImageQuery } from '@/platforms/openai';
import { deleteFile } from '@/platforms/storage';
import { TAG_FAVS, isTagFavs } from '@/tag';
import { createStreamableValue } from 'ai/rsc';
import { redirect } from 'next/navigation';
import { Photo, convertPhotoToPhotoDbInsert } from '.';
import { AiImageQuery, getAiImageQuery } from './ai';
import { generateAiImageQueries } from './ai/server';
import { GetPhotosOptions, areOptionsSensitive } from './db';
import {
  PhotoFormData,
  convertFormDataToPhotoDbInsert,
  convertPhotoToFormData,
} from './form';
import { blurImageFromUrl, extractImageDataFromBlobPath } from './server';
import { convertUploadToPhoto } from './storage';
// import { UrlAddStatus } from '@/admin/AdminUploadsClient';
import { convertStringToArray } from '@/utility/string';
import { after } from 'next/server';

type UrlAddStatus = {
  url: string;
  status: 'adding' | 'added' | 'error';
  statusMessage: string;
  progress: number;
};

// Private actions

export const createPhotoAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const shouldStripGpsData = formData.get('shouldStripGpsData') === 'true';
    formData.delete('shouldStripGpsData');

    const photo = convertFormDataToPhotoDbInsert(formData);

    const updatedUrl = await convertUploadToPhoto({
      urlOrigin: photo.url,
      shouldStripGpsData,
    });

    if (updatedUrl) {
      photo.url = updatedUrl;
      await insertPhoto(photo);
      revalidateAllKeysAndPaths();
      redirect(PATH_ADMIN_PHOTOS);
    }
  });

export const addAllUploadsAction = async ({
  uploadUrls,
  tags,
  takenAtLocal,
  takenAtNaiveLocal,
  shouldRevalidateAllKeysAndPaths = true,
}: {
  uploadUrls: string[]
  tags?: string
  takenAtLocal: string
  takenAtNaiveLocal: string
  shouldRevalidateAllKeysAndPaths?: boolean
}) =>
  runAuthenticatedAdminServerAction(async () => {
    const PROGRESS_TASK_COUNT = AI_TEXT_GENERATION_ENABLED ? 5 : 4;

    const addedUploadUrls: string[] = [];
    let currentUploadUrl = '';
    let progress = 0;

    const stream = createStreamableValue<UrlAddStatus>();

    const streamUpdate = (
      statusMessage: string,
      status: UrlAddStatus['status'] = 'adding',
    ) =>
      stream.update({
        url: currentUploadUrl,
        status,
        statusMessage,
        progress: ++progress / PROGRESS_TASK_COUNT,
      });

    (async () => {
      try {
        for (const url of uploadUrls) {
          currentUploadUrl = url;
          progress = 0;
          streamUpdate('Parsing EXIF data');

          const {
            photoFormExif,
            imageResizedBase64,
            shouldStripGpsData,
            fileBytes,
          } = await extractImageDataFromBlobPath(url, {
            includeInitialPhotoFields: true,
            generateBlurData: BLUR_ENABLED,
            generateResizedImage: AI_TEXT_GENERATION_ENABLED,
          });

          if (photoFormExif) {
            if (AI_TEXT_GENERATION_ENABLED) {
              streamUpdate('Generating AI text');
            }

            const {
              title,
              caption,
              tags: aiTags,
              semanticDescription,
            } = await generateAiImageQueries(
              imageResizedBase64,
              AI_TEXT_AUTO_GENERATED_FIELDS,
            );

            const form: Partial<PhotoFormData> = {
              ...photoFormExif,
              title,
              caption,
              tags: tags || aiTags,
              semanticDescription,
              takenAt: photoFormExif.takenAt || takenAtLocal,
              takenAtNaive: photoFormExif.takenAtNaive || takenAtNaiveLocal,
            };

            streamUpdate('Transferring to photo storage');

            const updatedUrl = await convertUploadToPhoto({
              urlOrigin: url,
              fileBytes,
              shouldStripGpsData,
            });
            if (updatedUrl) {
              const subheadFinal = 'Adding to database';
              streamUpdate(subheadFinal);
              const photo = convertFormDataToPhotoDbInsert(form);
              photo.url = updatedUrl;
              await insertPhoto(photo);
              addedUploadUrls.push(url);
              // Re-submit with updated url
              streamUpdate(subheadFinal, 'added');
            }
          }
        };
      } catch (error: any) {
        // eslint-disable-next-line max-len
        stream.error(`${error.message} (${addedUploadUrls.length} of ${uploadUrls.length} photos successfully added)`);
      }
      stream.done();
    })();

    if (shouldRevalidateAllKeysAndPaths) {
      after(revalidateAllKeysAndPaths);
    }

    return stream.value;
  });

export const updatePhotoAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const photo = convertFormDataToPhotoDbInsert(formData);

    let urlToDelete: string | undefined;
    if (photo.hidden && photo.url.includes(photo.id)) {
      // Backfill:
      // Anonymize storage url on update if necessary by
      // re-running image upload transfer logic
      const url = await convertUploadToPhoto({
        urlOrigin: photo.url,
        shouldDeleteOrigin: false,
      });
      if (url) {
        urlToDelete = photo.url;
        photo.url = url;
      }
    }

    await updatePhoto(photo)
      .then(async () => {
        if (urlToDelete) { await deleteFile(urlToDelete); }
      });

    revalidatePhoto(photo.id);

    redirect(PATH_ADMIN_PHOTOS);
  });

export const tagMultiplePhotosAction = async (
  tags: string,
  photoIds: string[],
) =>
  runAuthenticatedAdminServerAction(async () => {
    await addTagsToPhotos(
      convertStringToArray(tags, false) ?? [],
      photoIds,
    );
    revalidateAllKeysAndPaths();
  });

export const toggleFavoritePhotoAction = async (
  photoId: string,
  shouldRedirect?: boolean,
) =>
  runAuthenticatedAdminServerAction(async () => {
    const photo = await getPhoto(photoId);
    if (photo) {
      const { tags } = photo;
      photo.tags = tags.some(tag => tag === TAG_FAVS)
        ? tags.filter(tag => !isTagFavs(tag))
        : [...tags, TAG_FAVS];
      await updatePhoto(convertPhotoToPhotoDbInsert(photo));
      revalidateAllKeysAndPaths();
      if (shouldRedirect) {
        redirect(pathForPhoto({ photo: photoId }));
      }
    }
  });

export const deletePhotosAction = async (photoIds: string[]) =>
  runAuthenticatedAdminServerAction(async () => {
    for (const photoId of photoIds) {
      const photo = await getPhoto(photoId, true);
      if (photo) {
        await deletePhoto(photoId).then(() => deleteFile(photo.url));
      }
    }
    revalidateAllKeysAndPaths();
  });

export const deletePhotoAction = async (
  photoId: string,
  photoUrl: string,
  shouldRedirect?: boolean,
) =>
  runAuthenticatedAdminServerAction(async () => {
    await deletePhoto(photoId).then(() => deleteFile(photoUrl));
    revalidateAllKeysAndPaths();
    if (shouldRedirect) {
      redirect(PATH_ROOT);
    }
  });

export const deletePhotoTagGloballyAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const tag = formData.get('tag') as string;

    await deletePhotoTagGlobally(tag);

    revalidatePhotosKey();
    revalidateAdminPaths();
  });

export const renamePhotoTagGloballyAction = async (formData: FormData) =>
  runAuthenticatedAdminServerAction(async () => {
    const tag = formData.get('tag') as string;
    const updatedTag = formData.get('updatedTag') as string;

    if (tag && updatedTag && tag !== updatedTag) {
      await renamePhotoTagGlobally(tag, updatedTag);
      revalidatePhotosKey();
      revalidateTagsKey();
      redirect(PATH_ADMIN_TAGS);
    }
  });

export const deleteUploadAction = async (url: string) =>
  runAuthenticatedAdminServerAction(async () => {
    await deleteFile(url);
    revalidateAdminPaths();
  });

// Accessed from admin photo edit page
// will not update blur data
export const getExifDataAction = async (
  url: string,
): Promise<Partial<PhotoFormData>> =>
  runAuthenticatedAdminServerAction(async () => {
    const { photoFormExif } = await extractImageDataFromBlobPath(url);
    if (photoFormExif) {
      return photoFormExif;
    } else {
      return {};
    }
  });

// Accessed from admin photo table, will:
// - update EXIF data
// - anonymize storage url if necessary
// - strip GPS data if necessary
// - update blur data (or destroy if blur is disabled)
// - generate AI text data, if enabled, and auto-generated fields are empty
export const syncPhotoAction = async (photoId: string) =>
  runAuthenticatedAdminServerAction(async () => {
    const photo = await getPhoto(photoId ?? '', true);

    if (photo) {
      const {
        photoFormExif,
        imageResizedBase64,
        shouldStripGpsData,
        fileBytes,
      } = await extractImageDataFromBlobPath(photo.url, {
        includeInitialPhotoFields: false,
        generateBlurData: BLUR_ENABLED,
        generateResizedImage: AI_TEXT_GENERATION_ENABLED,
      });

      let urlToDelete: string | undefined;
      if (photoFormExif) {
        if (photo.url.includes(photo.id) || shouldStripGpsData) {
          // Anonymize storage url on update if necessary by
          // re-running image upload transfer logic
          const url = await convertUploadToPhoto({
            urlOrigin: photo.url,
            fileBytes,
            shouldStripGpsData,
            shouldDeleteOrigin: false,
          });
          if (url) {
            urlToDelete = photo.url;
            photo.url = url;
          }
        }

        const {
          title: atTitle,
          caption: aiCaption,
          tags: aiTags,
          semanticDescription: aiSemanticDescription,
        } = await generateAiImageQueries(
          imageResizedBase64,
          AI_TEXT_AUTO_GENERATED_FIELDS,
        );

        const photoFormDbInsert = convertFormDataToPhotoDbInsert({
          ...convertPhotoToFormData(photo),
          ...photoFormExif,
          ...!BLUR_ENABLED && { blurData: undefined },
          ...!photo.title && { title: atTitle },
          ...!photo.caption && { caption: aiCaption },
          ...photo.tags.length === 0 && { tags: aiTags },
          ...!photo.semanticDescription &&
          { semanticDescription: aiSemanticDescription },
        });

        await updatePhoto(photoFormDbInsert)
          .then(async () => {
            if (urlToDelete) { await deleteFile(urlToDelete); }
          });

        revalidateAllKeysAndPaths();
      }
    }
  });

export const syncPhotosAction = async (photoIds: string[]) =>
  runAuthenticatedAdminServerAction(async () => {
    for (const photoId of photoIds) {
      await syncPhotoAction(photoId);
    }
    revalidateAllKeysAndPaths();
  });

export const clearCacheAction = async () =>
  runAuthenticatedAdminServerAction(revalidateAllKeysAndPaths);

export const streamAiImageQueryAction = async (
  imageBase64: string,
  query: AiImageQuery,
) =>
  runAuthenticatedAdminServerAction(async () => {
    const existingTags = await getUniqueTags();
    return streamOpenAiImageQuery(
      imageBase64,
      getAiImageQuery(query, existingTags),
    );
  });

export const getImageBlurAction = async (url: string) =>
  runAuthenticatedAdminServerAction(() => blurImageFromUrl(url));

export const getPhotosHiddenMetaCachedAction = async () =>
  runAuthenticatedAdminServerAction(() =>
    getPhotosMetaCached({ hidden: 'only' }));

// Public/Private actions

export const getPhotosAction = async (
  options: GetPhotosOptions,
  warmOnly?: boolean,
) => {
  if (warmOnly) {
    return [];
  } else {
    return areOptionsSensitive(options)
      ? runAuthenticatedAdminServerAction(() => getPhotos(options))
      : getPhotos(options);
  }
};

export const getPhotosCachedAction = async (
  options: GetPhotosOptions,
  warmOnly?: boolean,
) => {
  if (warmOnly) {
    return [];
  } else {
    return areOptionsSensitive(options)
      ? runAuthenticatedAdminServerAction(() => getPhotosCached(options))
      : getPhotosCached(options);
  }
};

// Public actions

export const searchPhotosAction = async (query: string) =>
  getPhotos({ query, limit: 10 })
    .catch(e => {
      console.error('Could not query photos', e);
      return [] as Photo[];
    });
