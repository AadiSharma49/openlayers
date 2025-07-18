import {spy as sinonSpy} from 'sinon';
import Map from '../../../../../src/ol/Map.js';
import MapBrowserEvent from '../../../../../src/ol/MapBrowserEvent.js';
import View from '../../../../../src/ol/View.js';
import {never} from '../../../../../src/ol/events/condition.js';
import ExtentInteraction from '../../../../../src/ol/interaction/Extent.js';

describe('ol.interaction.Extent', function () {
  let map, interaction;

  const width = 360;
  const height = 180;

  beforeEach(function () {
    const target = createMapDiv(width, height);

    map = new Map({
      target: target,
      layers: [],
      view: new View({
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1,
      }),
    });
    map.renderSync();

    interaction = new ExtentInteraction();
    map.addInteraction(interaction);
  });

  afterEach(function () {
    if (map) {
      disposeMap(map);
    }
    map = null;
    interaction = null;
  });

  /**
   * Simulates a browser event on the map viewport.  The client x/y location
   * will be adjusted as if the map were centered at 0,0.
   * @param {string} type Event type.
   * @param {number} x Horizontal offset from map center.
   * @param {number} y Vertical offset from map center.
   * @param {boolean} [opt_shiftKey] Shift key is pressed.
   * @param {number} button The mouse button.
   */
  function simulateEvent(type, x, y, opt_shiftKey, button) {
    const viewport = map.getViewport();
    // calculated in case body has top < 0 (test runner with small window)
    const position = viewport.getBoundingClientRect();
    const shiftKey = opt_shiftKey !== undefined ? opt_shiftKey : false;
    const pointerEvent = {};
    pointerEvent.type = type;
    pointerEvent.target = viewport.firstChild;
    pointerEvent.button = button;
    pointerEvent.clientX = position.left + x + width / 2;
    pointerEvent.clientY = position.top - y + height / 2;
    pointerEvent.shiftKey = shiftKey;
    pointerEvent.pointerId = 0;
    pointerEvent.preventDefault = function () {};
    const event = new MapBrowserEvent(type, map, pointerEvent);
    event.originalEvent.pointerId = 1;
    map.handleMapBrowserEvent(event);
  }

  describe('Constructor', function () {
    it('can be configured with an extent', function () {
      expect(function () {
        new ExtentInteraction({
          extent: [-10, -10, 10, 10],
        });
      }).to.not.throwException();
    });
  });

  describe('snap to vertex', function () {
    it('snap to vertex works', function () {
      interaction.setExtent([-50, -50, 50, 50]);

      expect(interaction.snapToVertex_([230, 40], map)).to.eql([50, 50]);
      expect(interaction.snapToVertex_([231, 41], map)).to.eql([50, 50]);
    });

    it('snap to edge works', function () {
      interaction.setExtent([-50, -50, 50, 50]);

      expect(interaction.snapToVertex_([230, 90], map)).to.eql([50, 0]);
      expect(interaction.snapToVertex_([230, 89], map)).to.eql([50, 1]);
      expect(interaction.snapToVertex_([231, 90], map)).to.eql([50, 0]);
    });
  });

  describe('draw extent', function () {
    let spy;
    beforeEach(function () {
      spy = sinonSpy(interaction, 'handleEvent');
    });
    afterEach(function () {
      interaction.handleEvent.restore();
    });

    it('drawing extent works', function () {
      simulateEvent('pointerdown', -50, -50, false, 0);
      simulateEvent('pointerdrag', 50, 50, false, 0);
      simulateEvent('pointerup', 50, 50, false, 0);

      expect(interaction.getExtent()).to.eql([-50, -50, 50, 50]);
    });

    it('clicking off extent nulls extent', function () {
      interaction.setExtent([-50, -50, 50, 50]);

      simulateEvent('pointerdown', -10, -10, false, 0);
      simulateEvent('pointerup', -10, -10, false, 0);

      expect(interaction.getExtent()).to.equal(null);
      expect(spy.lastCall.returnValue).to.be(false);
    });

    it('clicking off extent does not null extent if createCondition is false', function () {
      interaction.setExtent([-50, -50, 50, 50]);
      interaction.createCondition_ = never;

      simulateEvent('pointerdown', -10, -10, false, 0);
      simulateEvent('pointerup', -10, -10, false, 0);

      expect(interaction.getExtent()).to.eql([-50, -50, 50, 50]);
      expect(spy.lastCall.returnValue).to.be(true);
    });

    it('clicking on extent does not null extent', function () {
      interaction.setExtent([-50, -50, 50, 50]);

      simulateEvent('pointerdown', 50, 50, false, 0);
      simulateEvent('pointerup', 50, 50, false, 0);

      expect(interaction.getExtent()).to.eql([-50, -50, 50, 50]);
    });

    it('snap and drag vertex works', function () {
      interaction.setExtent([-50, -50, 50, 50]);

      simulateEvent('pointerdown', 51, 49, false, 0);
      simulateEvent('pointerdrag', -70, -40, false, 0);
      simulateEvent('pointerup', -70, -40, false, 0);

      expect(interaction.getExtent()).to.eql([-70, -50, -50, -40]);
    });

    it('snap and drag edge works', function () {
      interaction.setExtent([-50, -50, 50, 50]);

      simulateEvent('pointerdown', 51, 5, false, 0);
      simulateEvent('pointerdrag', 20, -30, false, 0);
      simulateEvent('pointerup', 20, -30, false, 0);

      expect(interaction.getExtent()).to.eql([-50, -50, 20, 50]);
    });

    it('drag extent works', function () {
      interaction.setExtent([-50, -50, 50, 50]);
      interaction.drag_ = true;

      simulateEvent('pointerdown', 0, 0, false, 0);
      simulateEvent('pointerdrag', -100, -100, false, 0);
      simulateEvent('pointerup', -100, -100, false, 0);

      expect(interaction.getExtent()).to.eql([-150, -150, -50, -50]);
    });
  });
});
