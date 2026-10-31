import React, { useEffect } from 'react';
import { PageMetadataConfig, applyDocumentMetadata } from './meta';

let prerenderMetadata: PageMetadataConfig | null = null;

/** Reset/read metadata collected during one synchronous server render. */
export function resetPrerenderMetadata(): void {
  prerenderMetadata = null;
}

export function getPrerenderMetadata(): PageMetadataConfig | null {
  return prerenderMetadata;
}

export const Head: React.FC<PageMetadataConfig> = (props) => {
  if (typeof window === 'undefined') {
    prerenderMetadata = props;
  }

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
