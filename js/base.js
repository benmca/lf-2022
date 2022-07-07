const nav = (document.getElementsByClassName('block-nav_toggle').item(0) || {});

nav.addEventListener('click', e => {
    nav.toggleAttribute("toggle");
    if(nav.hasAttribute("toggle")){
        toggle();
    } else {
        untoggle();
    }
});

function toggle(){
    nav.classList.add("toggled");
};

function untoggle(){
    nav.classList.remove("toggled");
};