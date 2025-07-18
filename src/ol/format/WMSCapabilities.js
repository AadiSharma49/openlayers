/**
 * @module ol/format/WMSCapabilities
 */
import {compareVersions} from '../string.js';
import {
  makeArrayPusher,
  makeObjectPropertyPusher,
  makeObjectPropertySetter,
  makeStructureNS,
  pushParseAndPop,
} from '../xml.js';
import XML from './XML.js';
import {readHref} from './xlink.js';
import {
  readBooleanString,
  readDecimal,
  readDecimalString,
  readNonNegativeIntegerString,
  readPositiveInteger,
  readString,
} from './xsd.js';

/**
 * @const
 * @type {Array<null|string>}
 */
const NAMESPACE_URIS = [
  null,
  'http://www.opengis.net/wms',
  'http://www.opengis.net/sld',
];

function isV13(objectStack) {
  return compareVersions(objectStack[0].version, '1.3') >= 0;
}

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Service': makeObjectPropertySetter(readService),
  'Capability': makeObjectPropertySetter(readCapability),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const CAPABILITY_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Request': makeObjectPropertySetter(readRequest),
  'Exception': makeObjectPropertySetter(readException),
  'Layer': makeObjectPropertySetter(readCapabilityLayer),
  'UserDefinedSymbolization': makeObjectPropertySetter(
    readUserDefinedSymbolization,
  ),
});

/**
 * @typedef {Object} RootObject
 * @property {string} version Version
 * @property {boolean} v13 Whether version is 1.3 or higher
 */

/**
 * @classdesc
 * Format for reading WMS capabilities data
 *
 * @api
 */
class WMSCapabilities extends XML {
  constructor() {
    super();

    /**
     * @type {string|undefined}
     */
    this.version = undefined;
  }

  /**
   * @param {Element} node Node.
   * @return {Object|null} Object
   * @override
   */
  readFromNode(node) {
    this.version = node.getAttribute('version').trim();
    const wmsCapabilityObject = pushParseAndPop(
      {
        'version': this.version,
      },
      PARSERS,
      node,
      [],
    );
    return wmsCapabilityObject ? wmsCapabilityObject : null;
  }
}

const COMMON_SERVICE_PARSERS = {
  'Name': makeObjectPropertySetter(readString),
  'Title': makeObjectPropertySetter(readString),
  'Abstract': makeObjectPropertySetter(readString),
  'KeywordList': makeObjectPropertySetter(readKeywordList),
  'OnlineResource': makeObjectPropertySetter(readHref),
  'ContactInformation': makeObjectPropertySetter(readContactInformation),
  'Fees': makeObjectPropertySetter(readString),
  'AccessConstraints': makeObjectPropertySetter(readString),
};

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const SERVICE_PARSERS = makeStructureNS(NAMESPACE_URIS, COMMON_SERVICE_PARSERS);

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const SERVICE_PARSERS_V13 = makeStructureNS(NAMESPACE_URIS, {
  ...COMMON_SERVICE_PARSERS,
  'LayerLimit': makeObjectPropertySetter(readPositiveInteger),
  'MaxWidth': makeObjectPropertySetter(readPositiveInteger),
  'MaxHeight': makeObjectPropertySetter(readPositiveInteger),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const CONTACT_INFORMATION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'ContactPersonPrimary': makeObjectPropertySetter(readContactPersonPrimary),
  'ContactPosition': makeObjectPropertySetter(readString),
  'ContactAddress': makeObjectPropertySetter(readContactAddress),
  'ContactVoiceTelephone': makeObjectPropertySetter(readString),
  'ContactFacsimileTelephone': makeObjectPropertySetter(readString),
  'ContactElectronicMailAddress': makeObjectPropertySetter(readString),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const CONTACT_PERSON_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'ContactPerson': makeObjectPropertySetter(readString),
  'ContactOrganization': makeObjectPropertySetter(readString),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const CONTACT_ADDRESS_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'AddressType': makeObjectPropertySetter(readString),
  'Address': makeObjectPropertySetter(readString),
  'City': makeObjectPropertySetter(readString),
  'StateOrProvince': makeObjectPropertySetter(readString),
  'PostCode': makeObjectPropertySetter(readString),
  'Country': makeObjectPropertySetter(readString),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const EXCEPTION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Format': makeArrayPusher(readString),
});

const COMMON_LAYER_PARSERS = {
  'Name': makeObjectPropertySetter(readString),
  'Title': makeObjectPropertySetter(readString),
  'Abstract': makeObjectPropertySetter(readString),
  'KeywordList': makeObjectPropertySetter(readKeywordList),
  'BoundingBox': makeObjectPropertyPusher(readBoundingBox),
  'Dimension': makeObjectPropertyPusher(readDimension),
  'Attribution': makeObjectPropertySetter(readAttribution),
  'AuthorityURL': makeObjectPropertyPusher(readAuthorityURL),
  'Identifier': makeObjectPropertyPusher(readString),
  'MetadataURL': makeObjectPropertyPusher(readMetadataURL),
  'DataURL': makeObjectPropertyPusher(readFormatOnlineresource),
  'FeatureListURL': makeObjectPropertyPusher(readFormatOnlineresource),
  'Style': makeObjectPropertyPusher(readStyle),
  'Layer': makeObjectPropertyPusher(readLayer),
};

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const LAYER_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  ...COMMON_LAYER_PARSERS,
  'SRS': makeObjectPropertyPusher(readString),
  'Extent': makeObjectPropertySetter(readExtent),
  'ScaleHint': makeObjectPropertyPusher(readScaleHint),
  'LatLonBoundingBox': makeObjectPropertySetter((node, objectStack) =>
    readBoundingBox(node, objectStack, false),
  ),
  'Layer': makeObjectPropertyPusher(readLayer),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const LAYER_PARSERS_V13 = makeStructureNS(NAMESPACE_URIS, {
  ...COMMON_LAYER_PARSERS,
  'CRS': makeObjectPropertyPusher(readString),
  'EX_GeographicBoundingBox': makeObjectPropertySetter(
    readEXGeographicBoundingBox,
  ),
  'MinScaleDenominator': makeObjectPropertySetter(readDecimal),
  'MaxScaleDenominator': makeObjectPropertySetter(readDecimal),
  'Layer': makeObjectPropertyPusher(readLayer),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const ATTRIBUTION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Title': makeObjectPropertySetter(readString),
  'OnlineResource': makeObjectPropertySetter(readHref),
  'LogoURL': makeObjectPropertySetter(readSizedFormatOnlineresource),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const EX_GEOGRAPHIC_BOUNDING_BOX_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'westBoundLongitude': makeObjectPropertySetter(readDecimal),
  'eastBoundLongitude': makeObjectPropertySetter(readDecimal),
  'southBoundLatitude': makeObjectPropertySetter(readDecimal),
  'northBoundLatitude': makeObjectPropertySetter(readDecimal),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const REQUEST_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'GetCapabilities': makeObjectPropertySetter(readOperationType),
  'GetMap': makeObjectPropertySetter(readOperationType),
  'GetFeatureInfo': makeObjectPropertySetter(readOperationType),
  'DescribeLayer': makeObjectPropertySetter(readOperationType),
  'GetLegendGraphic': makeObjectPropertySetter(readOperationType),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const OPERATIONTYPE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Format': makeObjectPropertyPusher(readString),
  'DCPType': makeObjectPropertyPusher(readDCPType),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const DCPTYPE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'HTTP': makeObjectPropertySetter(readHTTP),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const HTTP_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Get': makeObjectPropertySetter(readFormatOnlineresource),
  'Post': makeObjectPropertySetter(readFormatOnlineresource),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Name': makeObjectPropertySetter(readString),
  'Title': makeObjectPropertySetter(readString),
  'Abstract': makeObjectPropertySetter(readString),
  'LegendURL': makeObjectPropertyPusher(readSizedFormatOnlineresource),
  'StyleSheetURL': makeObjectPropertySetter(readFormatOnlineresource),
  'StyleURL': makeObjectPropertySetter(readFormatOnlineresource),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const FORMAT_ONLINERESOURCE_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Format': makeObjectPropertySetter(readString),
  'OnlineResource': makeObjectPropertySetter(readHref),
});

/**
 * @const
 * @type {Object<string, Object<string, import("../xml.js").Parser>>}
 */
// @ts-ignore
const KEYWORDLIST_PARSERS = makeStructureNS(NAMESPACE_URIS, {
  'Keyword': makeArrayPusher(readString),
});

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Attribution object.
 */
function readAttribution(node, objectStack) {
  return pushParseAndPop({}, ATTRIBUTION_PARSERS, node, objectStack);
}

function readUserDefinedSymbolization(node, objectStack) {
  return {
    'SupportSLD': !!readBooleanString(node.getAttribute('SupportSLD')),
    'UserLayer': !!readBooleanString(node.getAttribute('UserLayer')),
    'UserStyle': !!readBooleanString(node.getAttribute('UserStyle')),
    'RemoteWFS': !!readBooleanString(node.getAttribute('RemoteWFS')),
    'InlineFeatureData': !!readBooleanString(
      node.getAttribute('InlineFeatureData'),
    ),
    'RemoteWCS': !!readBooleanString(node.getAttribute('RemoteWCS')),
  };
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @param {boolean} withCrs Whether to include the CRS attribute.
 * @return {Object} Bounding box object.
 */
function readBoundingBox(node, objectStack, withCrs = true) {
  const extent = [
    readDecimalString(node.getAttribute('minx')),
    readDecimalString(node.getAttribute('miny')),
    readDecimalString(node.getAttribute('maxx')),
    readDecimalString(node.getAttribute('maxy')),
  ];

  const resolutions = [
    readDecimalString(node.getAttribute('resx')),
    readDecimalString(node.getAttribute('resy')),
  ];

  const result = {
    extent,
    res: resolutions,
  };
  if (!withCrs) {
    return result;
  }

  /** @type {RootObject} */
  if (isV13(objectStack)) {
    result.crs = node.getAttribute('CRS');
  } else {
    result.srs = node.getAttribute('SRS');
  }

  return result;
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {import("../extent.js").Extent|undefined} Bounding box object.
 */
function readEXGeographicBoundingBox(node, objectStack) {
  const geographicBoundingBox = pushParseAndPop(
    {},
    EX_GEOGRAPHIC_BOUNDING_BOX_PARSERS,
    node,
    objectStack,
  );
  if (!geographicBoundingBox) {
    return undefined;
  }
  const westBoundLongitude =
    /** @type {number|undefined} */
    (geographicBoundingBox['westBoundLongitude']);
  const southBoundLatitude =
    /** @type {number|undefined} */
    (geographicBoundingBox['southBoundLatitude']);
  const eastBoundLongitude =
    /** @type {number|undefined} */
    (geographicBoundingBox['eastBoundLongitude']);
  const northBoundLatitude =
    /** @type {number|undefined} */
    (geographicBoundingBox['northBoundLatitude']);
  if (
    westBoundLongitude === undefined ||
    southBoundLatitude === undefined ||
    eastBoundLongitude === undefined ||
    northBoundLatitude === undefined
  ) {
    return undefined;
  }
  return [
    westBoundLongitude,
    southBoundLatitude,
    eastBoundLongitude,
    northBoundLatitude,
  ];
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Capability object.
 */
//ts-ignore
function readCapability(node, objectStack) {
  return pushParseAndPop({}, CAPABILITY_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Service object.
 */
function readService(node, objectStack) {
  return pushParseAndPop(
    {},
    isV13(objectStack) ? SERVICE_PARSERS_V13 : SERVICE_PARSERS,
    node,
    objectStack,
  );
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Contact information object.
 */
function readContactInformation(node, objectStack) {
  return pushParseAndPop({}, CONTACT_INFORMATION_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Contact person object.
 */
function readContactPersonPrimary(node, objectStack) {
  return pushParseAndPop({}, CONTACT_PERSON_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Contact address object.
 */
function readContactAddress(node, objectStack) {
  return pushParseAndPop({}, CONTACT_ADDRESS_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Array<string>|undefined} Format array.
 */
function readException(node, objectStack) {
  return pushParseAndPop([], EXCEPTION_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Layer object.
 */
function readCapabilityLayer(node, objectStack) {
  const layerObject = pushParseAndPop(
    {},
    isV13(objectStack) ? LAYER_PARSERS_V13 : LAYER_PARSERS,
    node,
    objectStack,
  );

  if (layerObject['Layer'] === undefined) {
    return Object.assign(layerObject, readLayer(node, objectStack));
  }

  return layerObject;
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Layer object.
 */
function readLayer(node, objectStack) {
  const v13 = isV13(objectStack);

  const parentLayerObject = /**  @type {!Object<string,*>} */ (
    objectStack[objectStack.length - 1]
  );

  const layerObject = pushParseAndPop(
    {},
    v13 ? LAYER_PARSERS_V13 : LAYER_PARSERS,
    node,
    objectStack,
  );

  if (!layerObject) {
    return undefined;
  }
  let queryable = readBooleanString(node.getAttribute('queryable'));
  if (queryable === undefined) {
    queryable = parentLayerObject['queryable'];
  }
  layerObject['queryable'] = queryable !== undefined ? queryable : false;

  let cascaded = readNonNegativeIntegerString(node.getAttribute('cascaded'));
  if (cascaded === undefined) {
    cascaded = parentLayerObject['cascaded'];
  }
  layerObject['cascaded'] = cascaded;

  let opaque = readBooleanString(node.getAttribute('opaque'));
  if (opaque === undefined) {
    opaque = parentLayerObject['opaque'];
  }
  layerObject['opaque'] = opaque !== undefined ? opaque : false;

  let noSubsets = readBooleanString(node.getAttribute('noSubsets'));
  if (noSubsets === undefined) {
    noSubsets = parentLayerObject['noSubsets'];
  }
  layerObject['noSubsets'] = noSubsets !== undefined ? noSubsets : false;

  let fixedWidth = readDecimalString(node.getAttribute('fixedWidth'));
  if (!fixedWidth) {
    fixedWidth = parentLayerObject['fixedWidth'];
  }
  layerObject['fixedWidth'] = fixedWidth;

  let fixedHeight = readDecimalString(node.getAttribute('fixedHeight'));
  if (!fixedHeight) {
    fixedHeight = parentLayerObject['fixedHeight'];
  }
  layerObject['fixedHeight'] = fixedHeight;

  // See 7.2.4.8
  const addKeys = ['Style', 'AuthorityURL'];
  if (v13) {
    addKeys.push('CRS');
  } else {
    addKeys.push('SRS', 'Dimension');
  }
  addKeys.forEach(function (key) {
    if (key in parentLayerObject) {
      const childValue = layerObject[key] || [];
      layerObject[key] = childValue.concat(parentLayerObject[key]);
    }
  });

  const replaceKeys = ['BoundingBox', 'Attribution'];
  if (v13) {
    replaceKeys.push(
      'Dimension',
      'EX_GeographicBoundingBox',
      'MinScaleDenominator',
      'MaxScaleDenominator',
    );
  } else {
    replaceKeys.push('LatLonBoundingBox', 'ScaleHint', 'Extent');
  }
  replaceKeys.forEach(function (key) {
    if (!(key in layerObject)) {
      const parentValue = parentLayerObject[key];
      layerObject[key] = parentValue;
    }
  });

  return layerObject;
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object} Dimension object.
 */
function readDimension(node, objectStack) {
  const dimensionObject = {
    'name': node.getAttribute('name'),
    'units': node.getAttribute('units'),
    'unitSymbol': node.getAttribute('unitSymbol'),
  };

  if (isV13(objectStack)) {
    Object.assign(dimensionObject, {
      'default': node.getAttribute('default'),
      'multipleValues': readBooleanString(node.getAttribute('multipleValues')),
      'nearestValue': readBooleanString(node.getAttribute('nearestValue')),
      'current': readBooleanString(node.getAttribute('current')),
      'values': readString(node),
    });
  }
  return dimensionObject;
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object} Extent object.
 */
function readExtent(node, objectStack) {
  return {
    'name': node.getAttribute('name'),
    'default': node.getAttribute('default'),
    'nearestValue': readBooleanString(node.getAttribute('nearestValue')),
  };
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object} ScaleHint object.
 */
function readScaleHint(node, objectStack) {
  return {
    'min': readDecimalString(node.getAttribute('min')),
    'max': readDecimalString(node.getAttribute('max')),
  };
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Online resource object.
 */
function readFormatOnlineresource(node, objectStack) {
  return pushParseAndPop({}, FORMAT_ONLINERESOURCE_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Request object.
 */
function readRequest(node, objectStack) {
  return pushParseAndPop({}, REQUEST_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} DCP type object.
 */
function readDCPType(node, objectStack) {
  return pushParseAndPop({}, DCPTYPE_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} HTTP object.
 */
function readHTTP(node, objectStack) {
  return pushParseAndPop({}, HTTP_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Operation type object.
 */
function readOperationType(node, objectStack) {
  return pushParseAndPop({}, OPERATIONTYPE_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Online resource object.
 */
function readSizedFormatOnlineresource(node, objectStack) {
  const formatOnlineresource = readFormatOnlineresource(node, objectStack);
  if (formatOnlineresource) {
    const size = [
      readNonNegativeIntegerString(node.getAttribute('width')),
      readNonNegativeIntegerString(node.getAttribute('height')),
    ];
    formatOnlineresource['size'] = size;
    return formatOnlineresource;
  }
  return undefined;
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Authority URL object.
 */
function readAuthorityURL(node, objectStack) {
  const authorityObject = readFormatOnlineresource(node, objectStack);
  if (authorityObject) {
    authorityObject['name'] = node.getAttribute('name');
    return authorityObject;
  }
  return undefined;
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Metadata URL object.
 */
function readMetadataURL(node, objectStack) {
  const metadataObject = readFormatOnlineresource(node, objectStack);
  if (metadataObject) {
    metadataObject['type'] = node.getAttribute('type');
    return metadataObject;
  }
  return undefined;
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Object|undefined} Style object.
 */
function readStyle(node, objectStack) {
  return pushParseAndPop({}, STYLE_PARSERS, node, objectStack);
}

/**
 * @param {Element} node Node.
 * @param {Array<*>} objectStack Object stack.
 * @return {Array<string>|undefined} Keyword list.
 */
function readKeywordList(node, objectStack) {
  return pushParseAndPop([], KEYWORDLIST_PARSERS, node, objectStack);
}

export default WMSCapabilities;
