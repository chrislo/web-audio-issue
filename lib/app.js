(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $(document).ready(function() {
    var NullNode, ParamsView, PlayerView, SineWaveGenerator, context, node1, node2, vin;
    if (typeof webkitAudioContext === 'undefined' && typeof AudioContext === 'undefined') {
      alert('Your browser does not support the Web Audio API. Try Google Chrome or a Webkit nightly build');
    }
    ParamsView = (function(_super) {

      __extends(ParamsView, _super);

      function ParamsView() {
        ParamsView.__super__.constructor.apply(this, arguments);
      }

      ParamsView.prototype.el = $('#params');

      ParamsView.prototype.initialize = function(osc) {
        return this.osc = osc;
      };

      ParamsView.prototype.events = {
        "change #frequency": "changeFrequency"
      };

      ParamsView.prototype.changeFrequency = function() {
        return this.osc.frequency = event.target.value;
      };

      return ParamsView;

    })(Backbone.View);
    PlayerView = (function(_super) {

      __extends(PlayerView, _super);

      function PlayerView() {
        PlayerView.__super__.constructor.apply(this, arguments);
      }

      PlayerView.prototype.el = $('#player');

      PlayerView.prototype.events = {
        "click input[value='play']": "play",
        "click input[value='stop']": "stop"
      };

      PlayerView.prototype.initialize = function(player) {
        return this.player = player;
      };

      PlayerView.prototype.play = function() {
        this.player.stop();
        return this.player.play();
      };

      PlayerView.prototype.stop = function() {
        return this.player.stop();
      };

      return PlayerView;

    })(Backbone.View);
    SineWaveGenerator = (function() {

      function SineWaveGenerator(context) {
        var self;
        this.context = context;
        self = this;
        this.node = this.context.createJavaScriptNode(1024, 0, 1);
        this.node.onaudioprocess = function(e) {
          return self.process(e);
        };
        this.phase = 0;
        this.frequency = 30;
        this.sample_rate = this.context.sampleRate;
        this.amplitude = 1;
      }

      SineWaveGenerator.prototype.process = function(e) {
        var data, i, sample, _ref, _results;
        data = e.outputBuffer.getChannelData(0);
        _results = [];
        for (i = 0, _ref = data.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
          sample = this.amplitude * Math.sin(this.phase);
          data[i] = sample;
          _results.push(this.phase = this.phase + ((2 * Math.PI * this.frequency) / this.sample_rate));
        }
        return _results;
      };

      SineWaveGenerator.prototype.connect = function(destination) {
        if (typeof destination.node === 'object') {
          return this.destination = destination.node;
        } else {
          return this.destination = destination;
        }
      };

      SineWaveGenerator.prototype.play = function() {
        return this.node.connect(this.destination);
      };

      SineWaveGenerator.prototype.stop = function() {
        return this.node.disconnect();
      };

      return SineWaveGenerator;

    })();
    NullNode = (function() {

      function NullNode(context) {
        var self;
        this.context = context;
        self = this;
        this.node = this.context.createJavaScriptNode(1024, 1, 1);
        this.node.onaudioprocess = function(e) {
          return self.process(e);
        };
      }

      NullNode.prototype.process = function(e) {
        var i, input_data, output_data, _ref, _results;
        input_data = e.inputBuffer.getChannelData(0);
        output_data = e.outputBuffer.getChannelData(0);
        _results = [];
        for (i = 0, _ref = output_data.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
          _results.push(output_data[i] = input_data[i]);
        }
        return _results;
      };

      NullNode.prototype.connect = function(destination) {
        var d;
        if (typeof destination.node === 'object') {
          d = destination.node;
        } else {
          d = destination;
        }
        console.log(d);
        return this.node.connect(d);
      };

      return NullNode;

    })();
    context = new webkitAudioContext;
    vin = new SineWaveGenerator(context);
    vin.frequency = 500;
    node1 = new NullNode(context);
    node2 = new NullNode(context);
    vin.connect(node1);
    node1.connect(node2);
    node2.connect(context.destination);
    return new PlayerView(vin);
  });

}).call(this);
