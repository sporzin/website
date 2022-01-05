<script>
  import { socials } from '../data/social';
</script>

<header>
  <!-- start navigation -->
  <nav
    class="navbar no-sticky navbar-expand-lg navbar-light bg-white header-light header-reverse-scroll top-logo z-index-1 navbar-boxed"
  >
    <div
      class="container-fluid flex-wrap nav-header-container h-100px xs-h-80px"
    >
      <div
        class="col-12 mx-lg-auto text-center d-flex align-items-center justify-content-between md-padding-15px-tb"
      >
        <div
          class="col-auto col-sm-4 header-social-icon text-start d-sm-flex d-none border-0 p-0"
        >
          {#each socials as social}
            <a title={social.name} href={social.url} target="_blank"
              ><i class={(social.logo, 'social-icons')} /></a
            >
          {/each}
        </div>
        <a
          class="col-auto col-sm-4 navbar-brand padding-15px-tb px-0"
          href="/"
          title="Sporzin"
        >
          <img src="images/logo.jpg" class="default-logo" alt="Sporzin" />
        </a>
        <div
          class="col-auto col-sm-4 d-flex align-items-center justify-content-end text-extra-dark-gray p-0"
        >
          <div class="header-push-button">
            <a href="javascript:void(0);" class="push-button ">
              <span />
              <span />
              <span />
              <span />
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <!-- end navigation -->
  <!-- start hamburger menu popup -->
  <div
    class="hamburger-menu hamburger-menu-big-font bg-extra-dark-gray w-25 xl-w-40 lg-w-45 md-w-50 sm-w-100 box-shadow-extra-large"
  >
    <a href="javascript:void(0);" class="close-menu text-white"
      ><i class="feather icon-feather-x icon-extra-small" /></a
    >
    <div class="row g-0 h-100">
      <div class="col-lg-12">
        <div
          class="row g-0 align-items-center justify-content-center h-100 padding-7-rem-all xs-padding-3-rem-all"
        >
          <div
            class="col-12 menu-list-wrapper menu-list-wrapper-small text-center text-md-start"
          >
            <!-- start menu -->
            <ul
              class="menu-list alt-font w-100 font-weight-500 letter-spacing-minus-2px"
            >
              <li class="menu-list-item"><a href="index.html">home</a></li>
              <li class="menu-list-item">
                <a href="mailto:ribrea@icloud.com">contact</a>
              </li>
            </ul>
            <!-- end menu -->
          </div>
          <div class="col-12 d-none d-md-block">
            <div class="alt-font margin-50px-top">
              <span class="margin-5px-bottom text-extra-large d-inline-block"
                >Let's work together?</span
              >
              <h6>
                <a
                  href="mailto:ribrea@icloud.com"
                  class="text-white text-decoration-line-bottom font-weight-500"
                  >ribrea@icloud.ir</a
                >
              </h6>
              <h6>
                <a
                  href="mailto:pouyababaie@gmail.com"
                  class="text-white text-decoration-line-bottom font-weight-500"
                  >pouyababaie123@gmail.com</a
                >
              </h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- end hamburger menu popup -->
</header>
