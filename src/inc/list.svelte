<script>
    let data2 = '{ "slidesPerView": "auto","speed": 1500, "snapOnRelease": true, "loop": true, "centerInsufficientSlides": true, "autoplay": { "delay": 2500 }, "navigation": { "nextEl": ".swiper-button-next-nav", "prevEl": ".swiper-button-previous-nav" }, "mousewheel": { "invert": true } }'
    let data = '{ "maxTilt": 20, "perspective": 1000, "easing": "cubic-bezier(.03,.98,.52,.99)", "scale": 1, "speed": 500, "transition": true, "reset": true, "glare": false, "maxGlare": 1 }'

    import {lists} from "../data/list";

</script>
<section class="horizontal-portfolio-slider-main p-0 fullscreen-top-space position-relative">
    <div class="d-flex flex-column justify-content-center h-100">
        <div class="swiper-container black-move horizontal-portfolio-slider padding-30px-bottom" data-slider-options='{data2}' data-slider-destroy='991'>


            <div class="swiper-wrapper">

                {#each lists as list}
                    <div class="swiper-slide w-30 text-center lg-w-35 md-w-100 md-margin-50px-bottom">
                        <div class="tilt-box-main z-index-0">
                            <div class="tilt-box" data-tilt-options='{data}'>
                                <a href="{list.url}">
                                    <img class="d-block margin-3-rem-bottom w-100 sm-margin-2-rem-bottom" src="{list.img}" alt="{list.title}" />
                                    <h2 class="slider-title alt-font font-weight-600 text-extra-dark-gray letter-spacing-minus-2px margin-5px-bottom">{list.title}<span class="slider-title-hover bg-extra-dark-gray"></span></h2>
                                    <div class="bottom-text text-large text-center text-medium-gray">{list.desc}</div>
                                </a>
                            </div>
                        </div>
                    </div>
                {/each}


            </div>





            <div class="swiper-button-next-nav swiper-button-next rounded-circle slider-navigation-style-07"><i class="feather icon-feather-arrow-right"></i></div>
            <div class="swiper-button-previous-nav swiper-button-prev rounded-circle slider-navigation-style-07"><i class="feather icon-feather-arrow-left"></i></div>
        </div>
    </div>
</section>