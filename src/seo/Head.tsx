import React, { useEffect } from 'react';
import { PageMetadataConfig, applyDocumentMetadata } from './meta';

export const Head: React.FC<PageMetadataConfig> = (props) => {
  useEffect(() => {
    applyDocumentMetadata(props);
  }, [
    props.title,
    props.description,
    props.locale,
    props.routeType,
    props.slug,
    props.isIndexable,
    props.ogType,
    props.publishedTime,
    props.author,
    props.schemaType,
    props.schemaData,
  ]);

  return null;
};
