
$(document).ready(function() {

    $(".block-nav_toggle").click(function () {
        toggleBlockNav();
    });

    $(".block-nav_scrim").click(function () {
        toggleBlockNav();
    });



    $(".block-nav_option").click(function () {
        // if this is toggled, silently fail
        if($(this).not("toggled")){
            $(".block-nav_detail").hide();
            $(".block-nav_option.toggled").toggleClass("toggled");
            $(this).toggleClass("toggled");
            var selected_tag = $(this).attr("data");
            $(".block-nav_detail[data=" + selected_tag + "]").show();
            $(".block-nav_detail[data=" + selected_tag + "]").scrollTop(0);
            // only toggle scrim if it's visble
            if(!$(".block-nav_scrim").hasClass("toggled")){
                toggleScrim();
            }
        }
    });

    function toggleScrim(){
        if($(".block-nav_scrim").hasClass('toggled')) {
            document.body.style.position = '';
            $(".block-nav_scrim").removeClass('toggled');
        }
        else {
            document.body.style.position = 'fixed';
            $(".block-nav_scrim").addClass('toggled');
        }
    };

    function toggleBlockNav () {
        $(".block-nav_toggle").toggleClass('toggled');
        $(".block-nav_home").toggleClass('toggled');
        $(".block-nav_options").toggleClass('toggled');
        //clear scrim and details
        if(!$(".block-nav_toggle").hasClass("toggled")){
            if($(".block-nav_scrim").hasClass('toggled')) {
                toggleScrim();
            }
            $(".block-nav_option").removeClass('toggled');
            $(".block-nav_detail").hide();
        }
    };

    function processImages(){
        $('.post img').each(function(){
             $(this).replaceWith( '<a href="' + this.src +  '" target="_blank">' + $(this).get(0).outerHTML + '</a>' );
        });
    }

    function processAbc(){
        $('.abc').each(function (){
           ABCJS.renderAbc($(this)[0].id, $(this).data('abc'));
        });
    }
    processImages();
    processAbc();
});

