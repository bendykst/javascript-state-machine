'use strict'

//-------------------------------------------------------------------------------------------------

var mixin    = require('./util/mixin'),
    Exception  = require('./util/exception'),
    camelize = require('./util/camelize');

//-------------------------------------------------------------------------------------------------

function Config(options, StateMachine) {

  options = options || {};

  this.options      = options; // preserving original options can be useful (e.g visualize plugin)
  this.defaults     = StateMachine.defaults;
  this.states       = [];
  this.transitions  = [];
  this.regionList   = [];
  this.stateRegions = {};
  this.map          = {};
  this.lifecycle    = this.configureLifecycle();
  this.init         = this.configureInitTransition(options.init);
  this.data         = this.configureData(options.data);
  this.methods      = this.configureMethods(options.methods);

  this.map[this.defaults.wildcard] = {};

  this.configureTransitions(options.transitions || []);
  this.configureRegions(options.regions || []);

  this.plugins = this.configurePlugins(options.plugins, StateMachine.plugin);

}

//-------------------------------------------------------------------------------------------------

mixin(Config.prototype, {

  addState: function(name) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
      this.stateRegions[name] = [];
    }
  },

  addStateLifecycleNames: function(name) {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  },

  addTransition: function(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  },

  addTransitionLifecycleNames: function(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  },

  mapTransition: function(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from);
    if (typeof to !== 'function')
      this.addState(to);
    this.addTransition(name);
    this.map[from][name] = transition;
    return transition;
  },

  configureLifecycle: function() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  },

  configureInitTransition: function(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  },

  configureData: function(data) {
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  },

  configureMethods: function(methods) {
    return methods || {};
  },

  configurePlugins: function(plugins, builtin) {
    plugins = plugins || [];
    var n, max, plugin;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function')
        plugins[n] = plugin = plugin()
      if (plugin.configure)
        plugin.configure(this);
    }
    return plugins
  },

  configureTransitions: function(transitions) {
    var i, n, transition, from, to, wildcard = this.defaults.wildcard;
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      from  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      for(i = 0 ; i < from.length ; i++) {
        this.mapTransition({ name: transition.name, from: from[i], to: to });
      }
    }
  },

  addRegion: function(name) {
    this.regionList.push(name);
  },

  configureRegions: function(regions) {
    var i, n, region, state, states;

    // Sorting regions by name ensures regions will be in alphabetical order both
    // in this.regions and each entry  in this.stateRegions
    regions.sort(function(a, b) {
      if (a.name > b.name) {
        return 1;
      }
      else if (a.name < b.name) {
        return -1;
      }
      else {
        return 0;
      }
    });

    for(n = 0 ; n < regions.length ; n++) {
      region = regions[n];
      states = region.states;

      if (n > 0 && region.name === regions[n-1].name) {
        throw new Exception("regions must be uniquely named", region[n-1], region);
      }

      this.addRegion(region.name);
      for(i = 0 ; i < states.length ; i++) {
        state = states[i];
        this.addState(state);
        this.stateRegions[state].push(region.name);
      }
    }
  },

  transitionFor: function(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  },

  transitionsFor: function(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  },

  allStates: function() {
    return this.states;
  },

  allTransitions: function() {
    return this.transitions;
  },

  allRegions: function() {
    return this.regionList;
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = Config;

//-------------------------------------------------------------------------------------------------
