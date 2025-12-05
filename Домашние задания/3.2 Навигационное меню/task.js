document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.menu__link');

  links.forEach(link => {
    link.onclick = function (event) {
      const menuItem = this.closest('.menu__item');
      if (!menuItem) {
        return;
      }

      const subMenu = menuItem.querySelector('.menu_sub');

      if (!subMenu) {
        return;
      }

      event.preventDefault();

      const parentMenu = menuItem.closest('.menu');

      const activeSubMenus = parentMenu.querySelectorAll('.menu_sub.menu_active');
      activeSubMenus.forEach(menu => {
        if (menu !== subMenu) {
          menu.classList.remove('menu_active');
        }
      });

      subMenu.classList.toggle('menu_active');

      return false;
    };
  });
});
