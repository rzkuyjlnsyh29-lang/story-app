// src/scripts/utils/view-transitions.js
class ViewTransitions {
    static async fadeIn(element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      await this.wait(50);
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      
      await this.wait(300);
      element.style.transition = '';
    }
  
    static async fadeOut(element) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      
      await this.wait(50);
      element.style.opacity = '0';
      element.style.transform = 'translateY(-20px)';
      
      await this.wait(200);
    }
  
    static async slideIn(element, direction = 'right') {
      const translations = {
        right: 'translateX(100%)',
        left: 'translateX(-100%)',
        up: 'translateY(-100%)',
        down: 'translateY(100%)'
      };
  
      element.style.transform = translations[direction] || translations.right;
      element.style.opacity = '0';
      element.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
      
      await this.wait(50);
      element.style.transform = 'translateX(0) translateY(0)';
      element.style.opacity = '1';
      
      await this.wait(400);
      element.style.transition = '';
    }
  
    static async slideOut(element, direction = 'left') {
      const translations = {
        right: 'translateX(100%)',
        left: 'translateX(-100%)',
        up: 'translateY(-100%)',
        down: 'translateY(100%)'
      };
  
      element.style.transform = 'translateX(0) translateY(0)';
      element.style.opacity = '1';
      element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      
      await this.wait(50);
      element.style.transform = translations[direction] || translations.left;
      element.style.opacity = '0';
      
      await this.wait(300);
    }
  
    static wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
  
  export default ViewTransitions;