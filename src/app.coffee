$(document).ready ->
  if typeof(webkitAudioContext) == 'undefined' && typeof(AudioContext) == 'undefined'
    alert 'Your browser does not support the Web Audio API. Try Google Chrome or a Webkit nightly build'

  class ParamsView extends Backbone.View
    el: $('#params')

    initialize: (osc) ->
      @osc = osc

    events:
      "change #frequency": "changeFrequency"

    changeFrequency: ->
      @osc.frequency = event.target.value

  class PlayerView extends Backbone.View
    el: $('#player')

    events:
      "click input[value='play']": "play"
      "click input[value='stop']": "stop"

    initialize: (player) ->
      @player = player

    play: ->
      @player.stop()
      @player.play()

    stop: ->
      @player.stop()

  class SineWaveGenerator
    constructor: (@context) ->
      self = this
      @node = @context.createJavaScriptNode(1024, 0, 1)
      @node.onaudioprocess = (e) -> self.process(e)
      @phase = 0
      @frequency = 30
      @sample_rate = @context.sampleRate
      @amplitude = 1

    process: (e) ->
      data = e.outputBuffer.getChannelData(0)

      for i in [0..data.length-1]
        sample = @amplitude * Math.sin(@phase)
        data[i] = sample
        @phase = @phase + ((2 * Math.PI * @frequency) / @sample_rate)

    connect: (destination) ->
      if (typeof destination.node == 'object')
        @destination = destination.node
      else
        @destination = destination

    play: ->
      @node.connect(@destination)

    stop: ->
      @node.disconnect()

  class NullNode
    constructor: (@context) ->
      self = this
      @node = @context.createJavaScriptNode(1024, 1, 1)
      @node.onaudioprocess = (e) -> self.process(e)

    process: (e) ->
      input_data = e.inputBuffer.getChannelData(0)
      output_data = e.outputBuffer.getChannelData(0)

      for i in [0..output_data.length-1]
        output_data[i] = input_data[i]

    connect: (destination) ->
      if (typeof destination.node=='object')
        d = destination.node
      else
        d = destination

      # Need this console.log otherwise the node won't connect.
      console.log d
      @node.connect(d)

  # Define a web audio context
  context = new webkitAudioContext

  # Input
  vin = new SineWaveGenerator(context)
  vin.frequency = 500

  # Inverter
  node1 = new NullNode(context)
  node2 = new NullNode(context)

  # Connect up the graph
  vin.connect(node1)
  node1.connect(node2)
  node2.connect(context.destination)

  # Hook up the view elements to the source
  new PlayerView(vin)

