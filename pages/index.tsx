import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import markdown from 'markdown-it';

const USERNAME = "sahan";
const HOSTNAME = "hasret";

type OutputLine = {
  type: 'command' | 'output' | 'link' | 'blogTitle' | 'contact' | 'social';
  content: string;
  href?: string;
  onClick?: () => void;
};

type Language = 'en' | 'tr' | 'es' | 'ru';

const translations = {
  en: {
    help: `Available commands:
  clear - Clear the terminal screen
  help - Show this help message
  date - Display the current date and time
  echo [text] - Display a line of text
  ls - List directory contents
  pwd - Print working directory
  whoami - Print the current user
  uname - Print system information
  history - Show command history
  lang [en|tr|es|ru] - Change language
  contact - Show contact information
  social - Show social media links
  blogs - List available blog posts
  explorer - Show a random blog post
  cat [blog-slug] - Read a blog post in the terminal
  search [query] - Search blog posts`,
    commandNotFound: (cmd: string) => `Command not found: ${cmd}. Type 'help' for a list of commands.`,
    languageChanged: 'Language changed to English',
    invalidLanguage: 'Invalid language. Use "en" for English, "tr" for Turkish, "es" for Spanish, or "ru" for Russian.',
    goodbye: 'Goodbye! Take care and have a great day!',
    contact: `Phone: +90 501 107 6929
Email: sahanhasretmail@gmail.com`,
    social: `LinkedIn
Instagram
GitHub
Udemy`,
    blogList: 'Available blog posts:',
    noBlogsFound: 'No blog posts found.',
    welcomeMessage: 'Welcome to the Blog Terminal! Type "help" to see available commands.',
    back: 'Back',
    clickToRead: 'Click on a blog title to read it.',
    packageUpdate: '37 packages can be updated.',
    securityUpdate: '17 updates are security updates.',
    catInstructions: "You can read blog posts in the terminal using the 'cat' command followed by the blog slug. For example: cat my-blog-post",
    clickToReadEfficient: "For a better reading experience, click on a blog title to open it in a more user-friendly format.",
    noBlogSpecified: "No blog post specified. Usage: cat [blog-slug]",
    blogNotFound: "Blog post not found.",
    search: "Search blog posts:",
    searchResults: "Search results:",
    noSearchResults: "No results found for your search.",
    clickToReadBlog: "Click to read",
  },
  tr: {
    help: `Kullanılabilir komutlar:
  clear - Terminal ekranını temizle
  help - Bu yardım mesajını göster
  date - Mevcut tarih ve saati göster
  echo [metin] - Bir metin satırı göster
  ls - Dizin içeriğini listele
  pwd - Mevcut çalışma dizinini göster
  whoami - Mevcut kullanıcıyı göster
  uname - Sistem bilgisini göster
  history - Komut geçmişini göster
  lang [en|tr|es|ru] - Dili değiştir
  contact - İletişim bilgilerini göster
  social - Sosyal medya bağlantılarını göster
  blogs - Mevcut blog yazılarını listele
  explorer - Rastgele bir blog yazısı göster
  cat [blog-slug] - Blog yazısını terminalde oku
  search [sorgu] - Blog yazılarında ara`,
    commandNotFound: (cmd: string) => `Komut bulunamadı: ${cmd}. Komut listesi için 'help' yazın.`,
    languageChanged: 'Dil Türkçe olarak değiştirildi',
    invalidLanguage: 'Geçersiz dil. İngilizce için "en", Türkçe için "tr", İspanyolca için "es" veya Rusça için "ru" kullanın.',
    goodbye: 'Hoşça kalın! Kendinize iyi bakın ve iyi günler!',
    contact: `Telefon: +90 501 107 6929
E-posta: sahanhasretmail@gmail.com`,
    social: `LinkedIn
Instagram
GitHub
Udemy`,
    blogList: 'Mevcut blog yazıları:',
    noBlogsFound: 'Blog yazısı bulunamadı.',
    welcomeMessage: 'Blog Terminaline hoş geldiniz! Kullanılabilir komutları görmek için "help" yazın.',
    back: 'Geri Dön',
    clickToRead: 'Okumak istediğiniz blog başlığına tıklayın.',
    packageUpdate: '37 paket güncellenebilir.',
    securityUpdate: '17 güncelleme güvenlik güncellemesidir.',
    catInstructions: "Blog yazılarını 'cat' komutunu kullanarak terminalde okuyabilirsiniz. Örnek: cat blog-yazim",
    clickToReadEfficient: "Daha iyi bir okuma deneyimi için, blog başlığına tıklayarak daha kullanıcı dostu bir formatta açabilirsiniz.",
    noBlogSpecified: "Blog yazısı belirtilmedi. Kullanım: cat [blog-slug]",
    blogNotFound: "Blog yazısı bulunamadı.",
    search: "Blog yazılarında ara:",
    searchResults: "Arama sonuçları:",
    noSearchResults: "Aramanız için sonuç bulunamadı.",
    clickToReadBlog: "Okumak için tıklayın",
  },
  es: {
    help: `Comandos disponibles:
  clear - Limpiar la pantalla del terminal
  help - Mostrar este mensaje de ayuda
  date - Mostrar la fecha y hora actual
  echo [texto] - Mostrar una línea de texto
  ls - Listar contenidos del directorio
  pwd - Mostrar directorio de trabajo actual
  whoami - Mostrar usuario actual
  uname - Mostrar información del sistema
  history - Mostrar historial de comandos
  lang [en|tr|es|ru] - Cambiar idioma
  contact - Mostrar información de contacto
  social - Mostrar enlaces de redes sociales
  blogs - Listar entradas de blog disponibles
  explorer - Mostrar una entrada de blog aleatoria
  cat [blog-slug] - Leer una entrada de blog en el terminal
  search [consulta] - Buscar entradas de blog`,
    commandNotFound: (cmd: string) => `Comando no encontrado: ${cmd}. Escribe 'help' para ver la lista de comandos.`,
    languageChanged: 'Idioma cambiado a Español',
    invalidLanguage: 'Idioma inválido. Usa "en" para Inglés, "tr" para Turco, "es" para Español, o "ru" para Ruso.',
    goodbye: '¡Adiós! Cuídate y que tengas un buen día.',
    contact: `Teléfono: +90 501 107 6929
Correo electrónico: sahanhasretmail@gmail.com`,
    social: `LinkedIn
Instagram
GitHub
Udemy`,
    blogList: 'Entradas de blog disponibles:',
    noBlogsFound: 'No se encontraron entradas de blog.',
    welcomeMessage: '¡Bienvenido al Terminal de Blog! Escribe "help" para ver los comandos disponibles.',
    back: 'Volver',
    clickToRead: 'Haga clic en el título de un blog para leerlo.',
    packageUpdate: '37 paquetes pueden ser actualizados.',
    securityUpdate: '17 actualizaciones son actualizaciones de seguridad.',
    catInstructions: "Puede leer las entradas del blog en la terminal usando el comando 'cat' seguido del slug del blog. Por ejemplo: cat mi-entrada-de-blog",
    clickToReadEfficient: "Para una mejor experiencia de lectura, haga clic en el título de un blog para abrirlo en un formato más amigable.",
    noBlogSpecified: "No se especificó ninguna entrada de blog. Uso: cat [blog-slug]",
    blogNotFound: "Entrada de blog no encontrada.",
    search: "Buscar entradas de blog:",
    searchResults: "Resultados de la búsqueda:",
    noSearchResults: "No se encontraron resultados para su búsqueda.",
    clickToReadBlog: "Haga clic para leer",
  },
  ru: {
    help: `Доступные команды:
  clear - Очистить экран терминала
  help - Показать это справочное сообщение
  date - Показать текущую дату и время
  echo [текст] - Отобразить строку текста
  ls - Показать содержимое директории
  pwd - Показать текущую рабочую директорию
  whoami - Показать текущего пользователя
  uname - Показать информацию о системе
  history - Показать историю команд
  lang [en|tr|es|ru] - Изменить язык
  contact - Показать контактную информацию
  social - Показать ссылки на социальные сети
  blogs - Показать список доступных блогов
  explorer - Показать случайный блог
  cat [blog-slug] - Прочитать запись блога в терминале
  search [запрос] - Поиск записей блога`,
    commandNotFound: (cmd: string) => `Команда не найдена: ${cmd}. Введите 'help' для списка команд.`,
    languageChanged: 'Язык изменен на Русский',
    invalidLanguage: 'Неверный язык. Используйте "en" для Английского, "tr" для Турецкого, "es" для Испанского или "ru" для Русского.',
    goodbye: 'До свидания! Берегите себя и хорошего дня!',
    contact: `Телефон: +90 501 107 6929
Электронная почта: sahanhasretmail@gmail.com`,
    social: `LinkedIn
Instagram
GitHub
Udemy`,
    blogList: 'Доступные блоги:',
    noBlogsFound: 'Блоги не найдены.',
    welcomeMessage: 'Добро пожаловать в Блог Терминал! Введите "help", чтобы увидеть доступные команды.',
    back: 'Назад',
    clickToRead: 'Нажмите на заголовок блога, чтобы прочитать его.',
    packageUpdate: '37 пакетов могут быть обновлены.',
    securityUpdate: '17 обновлений являются обновлениями безопасности.',
    catInstructions: "Вы можете читать записи блога в терминале, используя команду 'cat', за которой следует слаг блога. Например: cat moy-blog-post",
    clickToReadEfficient: "Для лучшего опыта чтения, нажмите на заголовок блога, чтобы открыть его в более удобном формате.",
    noBlogSpecified: "Запись блога не указана. Использование: cat [blog-slug]",
    blogNotFound: "Запись блога не найдена.",
    search: "Поиск записей блога:",
    searchResults: "Результаты поиска:",
    noSearchResults: "По вашему запросу ничего не найдено.",
    clickToReadBlog: "Нажмите, чтобы прочитать",
  }
};

export default function Home({ blogPosts }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalContentRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  useEffect(() => {
    inputRef.current?.focus();
    const browserLang = navigator.language.split('-')[0] as Language;
    if (['en', 'tr', 'es', 'ru'].includes(browserLang)) {
      setLanguage(browserLang);
    }
  
    const initialMessages = [
      'Updating package lists...',
      'Reading package lists... Done',
      'Building dependency tree... Done',
      'Reading state information... Done',
      translations[browserLang].packageUpdate,
      translations[browserLang].securityUpdate,
      translations[browserLang].welcomeMessage
    ];
  
    let index = 0;
    const interval = setInterval(() => {
      if (index < initialMessages.length) {
        setOutput(prev => [...prev, { type: 'output', content: initialMessages[index] }]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500);
  
    return () => clearInterval(interval);
  }, []);

  const handleCommand = (command: string, args: string[]): OutputLine[] => {
    switch (command.toLowerCase()) {
      case 'clear':
        setOutput([]);
        return [];
      case 'help':
        return [{ type: 'output', content: translations[language].help }];
      case 'date':
        return [{ type: 'output', content: new Date().toLocaleString(language === 'en' ? 'en-US' : language === 'tr' ? 'tr-TR' : language === 'es' ? 'es-ES' : 'ru-RU') }];
      case 'echo':
        return [{ type: 'output', content: args.join(' ') }];
      case 'ls':
        return [{ type: 'output', content: `Documents  Downloads  Pictures  Music  Videos` }];
      case 'pwd':
        return [{ type: 'output', content: '/home/' + USERNAME }];
      case 'whoami':
        return [{ type: 'output', content: USERNAME }];
      case 'uname':
        return [{ type: 'output', content: 'Linux' }];
      case 'history':
        return [{ type: 'output', content: output
          .filter(line => line.type === 'command')
          .map(line => line.content)
          .join('\n') }];
      case 'lang':
        if (args[0] === 'en' || args[0] === 'tr' || args[0] === 'es' || args[0] === 'ru') {
          const newLang = args[0] as Language;
          if (newLang !== language) {
            setLanguage(newLang);
            return [{ type: 'output', content: translations[newLang].languageChanged }];
          }
          return [];
        } else {
          return [{ type: 'output', content: translations[language].invalidLanguage }];
        }
      case 'contact':
        return translations[language].contact.split('\n').map(line => {
          const [label, value] = line.split(': ');
          return {
            type: 'contact' as const,
            content: line,
            href: label.toLowerCase() === 'phone' ? `tel:${value}` : `mailto:${value}`
          };
        });
      case 'social':
        const socialLinks = {
          LinkedIn: 'https://linkedin.com/in/sahanhasret',
          Instagram: 'https://instagram.com/sahanhasret',
          GitHub: 'https://github.com/sahanhasret',
          Udemy: 'https://udemy.com/user/sahanhasret'
        };
        return translations[language].social.split('\n').map(platform => ({
          type: 'social' as const,
          content: platform,
          href: socialLinks[platform as keyof typeof socialLinks]
        }));
      case 'blogs':
        const currentLanguagePosts = blogPosts.filter(post => post.lang === language);
        if (currentLanguagePosts.length === 0) return [{ type: 'output', content: translations[language].noBlogsFound }];
        return [
          { type: 'output', content: translations[language].blogList },
          ...currentLanguagePosts.map(post => ({
            type: 'blogTitle' as const,
            content: `${post.title} - ${translations[language].clickToReadBlog}`,
            onClick: () => setSelectedBlog(post)
          })),
          { type: 'output', content: translations[language].catInstructions },
          { type: 'output', content: translations[language].clickToReadEfficient }
        ];
      case 'explorer':
        const filteredPosts = blogPosts.filter(post => post.lang === language);
        if (filteredPosts.length === 0) return [{ type: 'output', content: translations[language].noBlogsFound }];
        const randomBlog = filteredPosts[Math.floor(Math.random() * filteredPosts.length)];
        return [
          { type: 'blogTitle', content: `${randomBlog.title} - ${translations[language].clickToReadBlog}`, onClick: () => setSelectedBlog(randomBlog) },
          { type: 'output', content: translations[language].clickToReadEfficient }
        ];
      case 'cat':
        if (args.length === 0) return [{ type: 'output', content: translations[language].noBlogSpecified }];
        const blog = blogPosts.find(post => post.slug === args[0] && post.lang === language);
        if (!blog) return [{ type: 'output', content: translations[language].blogNotFound }];
        return [{ type: 'output', content: blog.content }];
      case 'search':
        if (args.length === 0) return [{ type: 'output', content: translations[language].search }];
        const searchTerm = args.join(' ').toLowerCase();
        const searchResults = blogPosts
          .filter(post => post.lang === language && 
            (post.title.toLowerCase().includes(searchTerm) || post.content.toLowerCase().includes(searchTerm)))
          .map(post => ({
            type: 'blogTitle' as const,
            content: `${post.title} - ${translations[language].clickToReadBlog}`,
            onClick: () => setSelectedBlog(post)
          }));
        if (searchResults.length === 0) return [{ type: 'output', content: translations[language].noSearchResults }];
        return [
          { type: 'output', content: translations[language].searchResults },
          ...searchResults,
          { type: 'output', content: translations[language].clickToReadEfficient }
        ];
      default:
        return [{ type: 'output', content: translations[language].commandNotFound(command) }];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCommand = input.trim();
    const [command, ...args] = fullCommand.split(' ');
    const commandLine = `${USERNAME}@${HOSTNAME}:~$ ${fullCommand}`;
    const commandOutput = handleCommand(command, args);
    setOutput(prev => [...prev, { type: 'command', content: commandLine }, ...commandOutput]);
    setInput('');
  };

  const handleCloseTerminal = () => {
    setOutput(prev => [...prev, { type: 'output', content: translations[language].goodbye }]);
    setTimeout(() => setIsTerminalOpen(false), 2000);
  };

  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  if (!isTerminalOpen) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#300A24] text-[#FFFFFF] font-mono text-sm flex flex-col">
      <div className="terminal-header">
        <div className="terminal-button close-button" onClick={handleCloseTerminal}></div>
        <div className="terminal-button minimize-button"></div>
        <div className="terminal-button maximize-button"></div>
        <span className="ml-2">Blog Terminal</span>
      </div>
      <div ref={terminalContentRef} className="terminal-content flex-grow overflow-auto p-4 flex flex-col">
        {selectedBlog ? (
          <div>
            <h1 className="text-2xl mb-4">{selectedBlog.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: selectedBlog.htmlContent }} />
            <button 
              onClick={() => setSelectedBlog(null)} 
              className="mt-8 bg-transparent text-green-400 py-2 px-4 border border-green-400 rounded hover:bg-green-400 hover:text-[#300A24] transition-colors duration-200"
            >
              {translations[language].back}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow">
              {output.map((line, index) => (
                <pre key={index} className={`terminal-output ${line.type === 'command' ? 'command-input' : line.type === 'blogTitle' ? 'blog-title' : 'command-output'}`}>
                  {line.type === 'blogTitle' || line.type === 'contact' || line.type === 'social' ? (
                    <a href={line.href} onClick={line.onClick} className="underline text-green-400 hover:text-green-300 cursor-pointer" target="_blank" rel="noopener noreferrer">
                      {line.content}
                    </a>
                  ) : (
                    line.content
                  )}
                </pre>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex mt-2">
              <span className="prompt">{`${USERNAME}@${HOSTNAME}:~$ `}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-transparent outline-none flex-grow text-white caret-white"
              />
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const blogDir = path.join(process.cwd(), 'blogs');
  let blogPosts: any[] = [];

  try {
    const filenames = fs.readdirSync(blogDir);
    
    blogPosts = filenames.map(filename => {
      const filePath = path.join(blogDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      const md = markdown({
        html: true,
        breaks: true,
        linkify: true
      });
      const htmlContent = md.render(content);
      const plainTextContent = htmlContent.replace(/<[^>]*>/g, '');

      return {
        slug: filename.replace('.md', ''),
        title: data.title || 'Untitled',
        content: plainTextContent,
        htmlContent: htmlContent,
        lang: data.lang || 'en',
        date: data.date,
      };
    });

    console.log(`Total blog posts: ${blogPosts.length}`);
  } catch (error) {
    console.error(`Error reading blog posts:`, error);
  }

  return {
    props: {
      blogPosts,
    },
  };
}