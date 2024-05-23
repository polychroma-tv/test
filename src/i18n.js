import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';


const resources = {
  'en': {
    translation: {
      'mute-on': 'Mute',
      'mute-off': 'Unmute',
      'fullscreen-on': 'Maximize Screen',
      'fullscreen-off': 'Minimize Screen',
      'menu-on': 'Close Menu',
      'menu-off': 'Open Menu',

      'later': 'Up next',

      'video-error': 'Ops, this video seems to not be working.\nPlease try another channel.',

      'suggest': 'Suggest video',
      'manifesto': 'Manifesto',
      'feedback': 'Feedback',
      'settings': 'Settings',
      'back':     'Back',

      'buymeacoffee': 'Support us',
      
      'turn-phone': 'Please turn your device for a better experience.',

      'welcome-cta': 'Start watching',
      'read-more': 'Read more',
      'read-the-manifesto': 'Read the manifesto',

      // Landing page
      'welcome-title': 'Curated videos to relax and explore the world from home',
      
      'welcome-heading1': 'Choose a channel and let your mind wander with the continuous stream of content',
      'welcome-body1': "It's television at the speed of life. And, as in life, it doesn't come with a pause or skips buttons. It's the ultimate minimalist, relaxing experience.",

      'welcome-heading2': 'A selection of videos from the best creators and stunning places around the world',
      'welcome-body2': 'It\'s built on top of a simple YouTube Player, so all views and ad revenue goes to the original creators - the real artists here :)',

      'welcome-heading3': 'Watch hundreds of hours of Slow TV content, dearly curated by human beings',
      'welcome-body3': 'We swept the World Wide Web to collect only the best adventures. For each video selected, ten other weren\'t.',

      'welcome-heading4': 'Enjoy it while you work, put on your TV or invite a friend for a remote stroll',
      'welcome-body4': 'Videos are always in sync, so just share the link with someone you want to watch together and you\'re good to go.',

      'welcome-final': 'Where do you want to escape to?',

      'welcome-bignum1': 'Continents',
      'welcome-bignum2': 'Creators',
      'welcome-bignum3': 'Curated videos',
      'welcome-bignum4': 'Hours of content',

      'footer': 'If you can, stay home. Save lives.'
    }
  },
  'fr': {
    translation: {
      'mute-on': 'Muet',
      'mute-off': 'Son activé',
      'fullscreen-on': 'Maximiser l\'écran',
      'fullscreen-off': 'Minimiser l\'écran',
      'menu-on': 'Fermer le menu',
      'menu-off': 'Ouvrir le menu',

      'later': 'À suivre',
      
      'suggest': 'Suggérer une vidéo',
      'manifesto': 'Manifeste',
      'feedback': 'Retour',
      'settings': 'Paramètres',
      'back':     'Retour',

      'buymeacoffee': 'Soutenez-nous',
      
      'turn-phone': 'Veuillez tourner votre appareil pour une meilleure expérience.',
      
      'welcome-cta': 'Commencer',
      'read-more': 'En savoir plus',
      'read-the-manifesto': 'Lire le manifeste',
      
      // Landing page
      'welcome-title': 'Vidéos sélectionnées pour se détendre et explorer le monde depuis chez soi',

      'welcome-heading1': 'Choisissez une chaîne et laissez votre esprit vagabonder avec le flux continu de contenu',
      'welcome-body1': "C'est la télévision à la vitesse de la vie. Et, comme dans la vie, il n'y a pas de bouton pause ou de saut. C'est l'expérience minimaliste et relaxante ultime.",

      'welcome-heading2': 'Une sélection de vidéos des meilleurs créateurs et des lieux étonnants du monde entier.',
      'welcome-body2': "Toutes les vues et les revenus publicitaires vont aux créateurs originaux - les vrais artistes ici :)",

      'welcome-heading3': 'Regardez des centaines d\'heures de contenu Slow TV, soigneusement sélectionné par des êtres humains.',
      'welcome-body3': 'Nous avons parcouru la World Wide Web pour ne collecter que les meilleures aventures. Pour chaque vidéo sélectionnée, dix autres ne l\'ont pas été.',

      'welcome-heading4': 'Profitez-en pendant que vous travaillez, mettez-le sur votre téléviseur ou invitez un ami pour une promenade à distance',
      'welcome-body4': 'Les vidéos sont toujours synchronisées, alors partagez simplement le lien avec quelqu\'un avec qui vous voulez regarder et c\'est parti.',

      'welcome-final': 'Où voulez-vous vous échapper ?',

      'welcome-bignum1': 'Continents',
      'welcome-bignum2': 'Créateurs',
      'welcome-bignum3': 'Vidéos sélectionnées',
      'welcome-bignum4': 'Heures de contenu',

      'footer': 'Si vous le pouvez, restez chez vous. Sauvez des vies.'
    }
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    // lng: 'fr',

    keySeparator: false,

    interpolation: {
      escapeValue: false
    }
  });

  export default i18n;
