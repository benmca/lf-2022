$(document).ready(function() {
    $(".block-nav_toggle").click(function () {
        $(".block-nav_toggle").toggleClass('toggled');
        $(".block-nav_home").toggleClass('toggled');
        $(".block-nav_options").toggleClass('toggled');
        //clear scrim and details
        if(!$(".block-nav_toggle").hasClass("toggled")){
            $(".block-nav_option").removeClass('toggled');
            $(".block-nav_detail").hide();
            $(".block-nav_scrim").removeClass('toggled');
        }
    });

    $(".block-nav_option").click(function () {
        // if this is toggled, silently fail
        if($(this).not("toggled")){
                // block-nav_scrim
            $(".block-nav_detail").hide();
            $(".block-nav_option.toggled").toggleClass("toggled");
            $(this).toggleClass("toggled");
            var selected_tag = $(this).attr("data");
            $(".block-nav_detail[data=" + selected_tag + "]").show();
            $(".block-nav_detail[data=" + selected_tag + "]").scrollTop(0);
            if(!$(".block-nav_scrim").hasClass("toggled")){
                $(".block-nav_scrim").toggleClass("toggled");
            }
        }
    });
});

