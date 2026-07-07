import { Photo, LayoutType, RowsPhotoAlbumProps, ColumnsPhotoAlbumProps, MasonryPhotoAlbumProps, ElementRef, JSXElement } from '../types.js';
import 'react';

type PhotoAlbumProps<TPhoto extends Photo> = ({
    layout: Extract<LayoutType, "rows">;
} & RowsPhotoAlbumProps<TPhoto>) | ({
    layout: Extract<LayoutType, "columns">;
} & ColumnsPhotoAlbumProps<TPhoto>) | ({
    layout: Extract<LayoutType, "masonry">;
} & MasonryPhotoAlbumProps<TPhoto>);
declare const _default: <TPhoto extends Photo>(props: PhotoAlbumProps<TPhoto> & ElementRef) => JSXElement | null;

export { _default as default };
