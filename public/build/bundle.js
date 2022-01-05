
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    let socials = [
      {
        url: 'https://instagram/sporzin',
        name: 'instagram',
        logo: 'fab fa-instagram social-icon',
      },
      {
        url: 'https://t.me/sary_golin',
        name: 'Telegram',
        logo: 'fab fa-telegram social-icon',
      },
      {
        url: 'https://github.com/sporzin/',
        name: 'Telegram',
        logo: 'fab fa-github social-icon',
      },
    ];

    /* src/inc/header.svelte generated by Svelte v3.44.0 */
    const file$2 = "src/inc/header.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (19:10) {#each socials as social}
    function create_each_block$1(ctx) {
    	let a;
    	let i;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", "" + (null_to_empty(/*social*/ ctx[0].logo) + " svelte-n63pf4"));
    			add_location(i, file$2, 20, 15, 714);
    			attr_dev(a, "title", /*social*/ ctx[0].name);
    			attr_dev(a, "href", /*social*/ ctx[0].url);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 19, 12, 642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:10) {#each socials as social}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let header;
    	let nav;
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div2;
    	let div1;
    	let a1;
    	let span0;
    	let t2;
    	let span1;
    	let t3;
    	let span2;
    	let t4;
    	let span3;
    	let t5;
    	let div11;
    	let a2;
    	let i;
    	let t6;
    	let div10;
    	let div9;
    	let div8;
    	let div5;
    	let ul;
    	let li0;
    	let a3;
    	let t8;
    	let li1;
    	let a4;
    	let t10;
    	let div7;
    	let div6;
    	let span4;
    	let t12;
    	let h60;
    	let a5;
    	let t14;
    	let h61;
    	let a6;
    	let each_value = socials;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			a0 = element("a");
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			a1 = element("a");
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			t3 = space();
    			span2 = element("span");
    			t4 = space();
    			span3 = element("span");
    			t5 = space();
    			div11 = element("div");
    			a2 = element("a");
    			i = element("i");
    			t6 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a3 = element("a");
    			a3.textContent = "home";
    			t8 = space();
    			li1 = element("li");
    			a4 = element("a");
    			a4.textContent = "contact";
    			t10 = space();
    			div7 = element("div");
    			div6 = element("div");
    			span4 = element("span");
    			span4.textContent = "Let's work together?";
    			t12 = space();
    			h60 = element("h6");
    			a5 = element("a");
    			a5.textContent = "ribrea@icloud.ir";
    			t14 = space();
    			h61 = element("h6");
    			a6 = element("a");
    			a6.textContent = "pouyababaie123@gmail.com";
    			attr_dev(div0, "class", "col-auto col-sm-4 header-social-icon text-start d-sm-flex d-none border-0 p-0");
    			add_location(div0, file$2, 15, 8, 483);
    			if (!src_url_equal(img.src, img_src_value = "images/logo.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "default-logo");
    			attr_dev(img, "alt", "Sporzin");
    			add_location(img, file$2, 29, 10, 936);
    			attr_dev(a0, "class", "col-auto col-sm-4 navbar-brand padding-15px-tb px-0");
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "title", "Sporzin");
    			add_location(a0, file$2, 24, 8, 798);
    			add_location(span0, file$2, 36, 14, 1265);
    			add_location(span1, file$2, 37, 14, 1288);
    			add_location(span2, file$2, 38, 14, 1311);
    			add_location(span3, file$2, 39, 14, 1334);
    			attr_dev(a1, "href", "javascript:void(0);");
    			attr_dev(a1, "class", "push-button ");
    			add_location(a1, file$2, 35, 12, 1199);
    			attr_dev(div1, "class", "header-push-button");
    			add_location(div1, file$2, 34, 10, 1154);
    			attr_dev(div2, "class", "col-auto col-sm-4 d-flex align-items-center justify-content-end text-extra-dark-gray p-0");
    			add_location(div2, file$2, 31, 8, 1022);
    			attr_dev(div3, "class", "col-12 mx-lg-auto text-center d-flex align-items-center justify-content-between md-padding-15px-tb");
    			add_location(div3, file$2, 12, 6, 347);
    			attr_dev(div4, "class", "container-fluid flex-wrap nav-header-container h-100px xs-h-80px");
    			add_location(div4, file$2, 9, 4, 251);
    			attr_dev(nav, "class", "navbar no-sticky navbar-expand-lg navbar-light bg-white header-light header-reverse-scroll top-logo z-index-1 navbar-boxed");
    			add_location(nav, file$2, 6, 2, 103);
    			attr_dev(i, "class", "feather icon-feather-x icon-extra-small");
    			add_location(i, file$2, 52, 7, 1702);
    			attr_dev(a2, "href", "javascript:void(0);");
    			attr_dev(a2, "class", "close-menu text-white");
    			add_location(a2, file$2, 51, 4, 1635);
    			attr_dev(a3, "href", "index.html");
    			add_location(a3, file$2, 66, 41, 2276);
    			attr_dev(li0, "class", "menu-list-item");
    			add_location(li0, file$2, 66, 14, 2249);
    			attr_dev(a4, "href", "mailto:ribrea@icloud.com");
    			add_location(a4, file$2, 68, 16, 2369);
    			attr_dev(li1, "class", "menu-list-item");
    			add_location(li1, file$2, 67, 14, 2325);
    			attr_dev(ul, "class", "menu-list alt-font w-100 font-weight-500 letter-spacing-minus-2px");
    			add_location(ul, file$2, 63, 12, 2129);
    			attr_dev(div5, "class", "col-12 menu-list-wrapper menu-list-wrapper-small text-center text-md-start");
    			add_location(div5, file$2, 59, 10, 1973);
    			attr_dev(span4, "class", "margin-5px-bottom text-extra-large d-inline-block");
    			add_location(span4, file$2, 75, 14, 2615);
    			attr_dev(a5, "href", "mailto:ribrea@icloud.com");
    			attr_dev(a5, "class", "text-white text-decoration-line-bottom font-weight-500");
    			add_location(a5, file$2, 79, 16, 2774);
    			add_location(h60, file$2, 78, 14, 2753);
    			attr_dev(a6, "href", "mailto:pouyababaie@gmail.com");
    			attr_dev(a6, "class", "text-white text-decoration-line-bottom font-weight-500");
    			add_location(a6, file$2, 86, 16, 3020);
    			add_location(h61, file$2, 85, 14, 2999);
    			attr_dev(div6, "class", "alt-font margin-50px-top");
    			add_location(div6, file$2, 74, 12, 2562);
    			attr_dev(div7, "class", "col-12 d-none d-md-block");
    			add_location(div7, file$2, 73, 10, 2511);
    			attr_dev(div8, "class", "row g-0 align-items-center justify-content-center h-100 padding-7-rem-all xs-padding-3-rem-all");
    			add_location(div8, file$2, 56, 8, 1835);
    			attr_dev(div9, "class", "col-lg-12");
    			add_location(div9, file$2, 55, 6, 1803);
    			attr_dev(div10, "class", "row g-0 h-100");
    			add_location(div10, file$2, 54, 4, 1769);
    			attr_dev(div11, "class", "hamburger-menu hamburger-menu-big-font bg-extra-dark-gray w-25 xl-w-40 lg-w-45 md-w-50 sm-w-100 box-shadow-extra-large");
    			add_location(div11, file$2, 48, 2, 1491);
    			add_location(header, file$2, 4, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, a0);
    			append_dev(a0, img);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(a1, span0);
    			append_dev(a1, t2);
    			append_dev(a1, span1);
    			append_dev(a1, t3);
    			append_dev(a1, span2);
    			append_dev(a1, t4);
    			append_dev(a1, span3);
    			append_dev(header, t5);
    			append_dev(header, div11);
    			append_dev(div11, a2);
    			append_dev(a2, i);
    			append_dev(div11, t6);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a3);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(li1, a4);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, span4);
    			append_dev(div6, t12);
    			append_dev(div6, h60);
    			append_dev(h60, a5);
    			append_dev(div6, t14);
    			append_dev(div6, h61);
    			append_dev(h61, a6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*socials*/ 0) {
    				each_value = socials;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ socials });
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    let lists = [
        {
            title: "Who We Are",
            desc: "Developer Team.",
            img: "images/home-creative-portfolio-img-01.jpg",
            url: "",
        },
        {
            title: "SaryGalin",
            desc: "Listen, Enjoy!",
            img: "images/home-creative-portfolio-img-02.jpg",
            url: "https://t.me/sary_golin",
        },
        {
            title: "Do It Correct!",
            desc: "Where to ask question.",
            img: "images/home-creative-portfolio-img-03.jpg",
            url: "",
        },
        {
            title: "DevOps",
            desc: "Let others see.",
            img: "images/home-creative-portfolio-img-04.jpg",
            url: "",
        },
        {
            title: "Web?",
            desc: "We're there! Just contact :)",
            img: "images/home-creative-portfolio-img-05.jpg",
            url: "https://localhost",
        },
        {
            title: "Creative?",
            desc: "We do our own.",
            img: "images/home-creative-portfolio-img-06.jpg",
            url: "",
        },
        {
            title: "Strategy?",
            desc: "Never Without.",
            img: "images/home-creative-portfolio-img-07.jpg",
            url: "",
        },
    ];

    /* src/inc/list.svelte generated by Svelte v3.44.0 */
    const file$1 = "src/inc/list.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (15:16) {#each lists as list}
    function create_each_block(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t1_value = /*list*/ ctx[2].title + "";
    	let t1;
    	let span;
    	let t2;
    	let div0;
    	let t3_value = /*list*/ ctx[2].desc + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			span = element("span");
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(img, "class", "d-block margin-3-rem-bottom w-100 sm-margin-2-rem-bottom");
    			if (!src_url_equal(img.src, img_src_value = /*list*/ ctx[2].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*list*/ ctx[2].title);
    			add_location(img, file$1, 19, 36, 1273);
    			attr_dev(span, "class", "slider-title-hover bg-extra-dark-gray");
    			add_location(span, file$1, 20, 162, 1544);
    			attr_dev(h2, "class", "slider-title alt-font font-weight-600 text-extra-dark-gray letter-spacing-minus-2px margin-5px-bottom");
    			add_location(h2, file$1, 20, 36, 1418);
    			attr_dev(div0, "class", "bottom-text text-large text-center text-medium-gray");
    			add_location(div0, file$1, 21, 36, 1645);
    			attr_dev(a, "href", /*list*/ ctx[2].url);
    			add_location(a, file$1, 18, 32, 1215);
    			attr_dev(div1, "class", "tilt-box");
    			attr_dev(div1, "data-tilt-options", /*data*/ ctx[1]);
    			add_location(div1, file$1, 17, 28, 1133);
    			attr_dev(div2, "class", "tilt-box-main z-index-0");
    			add_location(div2, file$1, 16, 24, 1067);
    			attr_dev(div3, "class", "swiper-slide w-30 text-center lg-w-35 md-w-100 md-margin-50px-bottom");
    			add_location(div3, file$1, 15, 20, 960);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, img);
    			append_dev(a, t0);
    			append_dev(a, h2);
    			append_dev(h2, t1);
    			append_dev(h2, span);
    			append_dev(a, t2);
    			append_dev(a, div0);
    			append_dev(div0, t3);
    			append_dev(div3, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(15:16) {#each lists as list}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let i0;
    	let t1;
    	let div2;
    	let i1;
    	let each_value = lists;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			i0 = element("i");
    			t1 = space();
    			div2 = element("div");
    			i1 = element("i");
    			attr_dev(div0, "class", "swiper-wrapper");
    			add_location(div0, file$1, 12, 12, 872);
    			attr_dev(i0, "class", "feather icon-feather-arrow-right");
    			add_location(i0, file$1, 35, 109, 2017);
    			attr_dev(div1, "class", "swiper-button-next-nav swiper-button-next rounded-circle slider-navigation-style-07");
    			add_location(div1, file$1, 35, 12, 1920);
    			attr_dev(i1, "class", "feather icon-feather-arrow-left");
    			add_location(i1, file$1, 36, 113, 2185);
    			attr_dev(div2, "class", "swiper-button-previous-nav swiper-button-prev rounded-circle slider-navigation-style-07");
    			add_location(div2, file$1, 36, 12, 2084);
    			attr_dev(div3, "class", "swiper-container black-move horizontal-portfolio-slider padding-30px-bottom");
    			attr_dev(div3, "data-slider-options", /*data2*/ ctx[0]);
    			attr_dev(div3, "data-slider-destroy", "991");
    			add_location(div3, file$1, 9, 8, 712);
    			attr_dev(div4, "class", "d-flex flex-column justify-content-center h-100");
    			add_location(div4, file$1, 8, 4, 642);
    			attr_dev(section, "class", "horizontal-portfolio-slider-main p-0 fullscreen-top-space position-relative");
    			add_location(section, file$1, 7, 0, 544);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, i0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, i1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data, lists*/ 2) {
    				each_value = lists;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, []);
    	let data2 = '{ "slidesPerView": "auto","speed": 1500, "snapOnRelease": true, "loop": true, "centerInsufficientSlides": true, "autoplay": { "delay": 2500 }, "navigation": { "nextEl": ".swiper-button-next-nav", "prevEl": ".swiper-button-previous-nav" }, "mousewheel": { "invert": true } }';
    	let data = '{ "maxTilt": 20, "perspective": 1000, "easing": "cubic-bezier(.03,.98,.52,.99)", "scale": 1, "speed": 500, "transition": true, "reset": true, "glare": false, "maxGlare": 1 }';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ data2, data, lists });

    	$$self.$inject_state = $$props => {
    		if ('data2' in $$props) $$invalidate(0, data2 = $$props.data2);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data2, data];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t;
    	let list;
    	let current;
    	header = new Header({ $$inline: true });
    	list = new List({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(list.$$.fragment);
    			add_location(main, file, 9, 0, 110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t);
    			mount_component(list, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(list);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, List });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
