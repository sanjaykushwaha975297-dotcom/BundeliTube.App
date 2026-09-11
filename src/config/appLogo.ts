/**
 * ==============================================================================
 * 🌟 BUNDELITUBE TOP-LEFT LOGO CONFIGURATION (लोगो सेटिंग)
 * ==============================================================================
 * 
 * यहाँ आप अपने लोगो (Logo) का URL (इमेज लिंक) या पाथ पेस्ट कर सकते हैं।
 * जैसे ही आप यहाँ लिंक पेस्ट करके लाइव करेंगे, ऐप के ऊपर (Top Left) 
 * तुरंत आपका वही लोगो दिखने लगेगा!
 *
 * 📌 उदाहरण (Examples):
 * 1. ऑनलाइन इमेज लिंक (Direct Image URL - Imgur, Cloudinary, Firebase, PostImage, etc.):
 *    logoUrl: 'https://i.ibb.co/your-logo.png',
 * 
 * 2. लोकल इमेज (अगर आपने public/ फोल्डर में logo.png डाला है):
 *    logoUrl: '/logo.png',
 * 
 * 3. Base64 इमेज (Data URI):
 *    logoUrl: 'data:image/png;base64,...',
 * 
 * 4. यदि इसे खाली छोड़ेंगे ('') तो BundeliTube का डिफ़ॉल्ट 3D प्ले लोगो दिखेगा।
 */

export interface AppLogoConfig {
  /**
   * ⬇️ अपना लोगो लिंक यहाँ दोनों कोट्स ('') के बीच पेस्ट करें:
   */
  logoUrl: string;

  /**
   * क्या लोगो के साथ "BundeliTube" लिखा हुआ नाम दिखाना है?
   * true  = लोगो और "BundeliTube" नाम दोनों दिखेंगे
   * false = केवल आपका लोगो दिखेगा (अगर आपके लोगो में पहले से ही BundeliTube लिखा है)
   */
  showBrandText: boolean;

  /**
   * लोगो का वैकल्पिक नाम / Alt Text
   */
  appName?: string;
}

export const APP_LOGO_CONFIG: AppLogoConfig = {
  // 👉 डिफ़ॉल्ट रूप से यह public/logo.png को स्वतः उठाएगा
  // अगर आप कोई ऑनलाइन लिंक देना चाहें तो यहाँ बदल सकते हैं:
  logoUrl: '/logo.png',

  // 👉 अगर आपके लोगो इमेज में पहले से BundeliTube लिखा है, तो इसे false कर सकते हैं:
  showBrandText: true,

  // ऐप का नाम:
  appName: 'BundeliTube'
};
