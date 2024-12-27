import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {asArray} from '../src/ol/color.js';
import MVT from '../src/ol/format/MVT.js';
import VectorTile from '../src/ol/layer/VectorTile.js';
import WebGLVectorTileLayerRenderer from '../src/ol/renderer/webgl/VectorTileLayer.js';
import VectorTileSource from '../src/ol/source/VectorTile.js';
import Fill from '../src/ol/style/Fill.js';
import Icon from '../src/ol/style/Icon.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';
import {packColor, parseLiteralStyle} from '../src/ol/webgl/styleparser.js';

const key =
  'pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ';

const parsedStyleResult = parseLiteralStyle({
  'fill-color': ['get', 'fillColor'],
  'stroke-color': ['get', 'strokeColor'],
  'stroke-width': ['get', 'strokeWidth'],
  'circle-radius': 4,
  'circle-fill-color': '#777',
});

class WebGLVectorTileLayer extends VectorTile {
  createRenderer() {
    return new WebGLVectorTileLayerRenderer(this, {
      style: {
        builder: parsedStyleResult.builder,
        attributes: {
          prop_fillColor: {
            size: 2,
            callback: (feature) => {
              const style = this.getStyle()(feature, 1)[0];
              const color = asArray(style?.getFill()?.getColor() || '#eee');
              return packColor(color);
            },
          },
          prop_strokeColor: {
            size: 2,
            callback: (feature) => {
              const style = this.getStyle()(feature, 1)[0];
              const color = asArray(style?.getStroke()?.getColor() || '#eee');
              return packColor(color);
            },
          },
          prop_strokeWidth: {
            size: 1,
            callback: (feature) => {
              const style = this.getStyle()(feature, 1)[0];
              return style?.getStroke()?.getWidth() || 0;
            },
          },
        },
      },
    });
  }
}

const map = new Map({
  layers: [
    new WebGLVectorTileLayer({
      source: new VectorTileSource({
        attributions:
          '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
          '© <a href="https://www.openstreetmap.org/copyright">' +
          'OpenStreetMap contributors</a>',
        format: new MVT(),
        url:
          'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
          '{z}/{x}/{y}.vector.pbf?access_token=' +
          key,
      }),
      style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
