$(document).ready(function() {
    $(".block-nav_toggle").click(function () {
        $(".block-nav_toggle").toggleClass('toggled');
        $(".block-nav_home").toggleClass('toggled');
        $(".block-nav_options").toggleClass('toggled');
    })
});
