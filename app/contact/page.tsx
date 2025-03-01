'use client';

export default function Contact() {
  return (
    <main className="flex justify-center py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Contato</h1>

        <div className="space-y-6">
          <div>
            <span className="font-medium text-lg">Telefone</span>
            <div>
              <a href="tel:+5521986351316" className="text-blue-600 hover:underline">
                +55 21 98635-1316
              </a>
            </div>
          </div>

          <div>
            <span className="font-medium text-lg">Email</span>
            <div>
              <a href="mailto:wilsondomingues@gmail.com" className="text-blue-600 hover:underline">
                wilsondomingues@gmail.com
              </a>
            </div>
          </div>

          <div>
            <span className="font-medium text-lg">Skype</span>
            <div>
              <a href="skype:Wilboor?chat" className="text-blue-600 hover:underline">
                Wilboor
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}