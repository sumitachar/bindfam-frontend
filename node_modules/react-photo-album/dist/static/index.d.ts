import React from 'react';
import { Photo, CommonPhotoAlbumProps, LayoutModel, Render, ComponentsProps, ElementRef } from '../types.js';

type StaticPhotoAlbumProps<TPhoto extends Photo> = Pick<CommonPhotoAlbumProps<TPhoto>, "sizes" | "onClick" | "skeleton"> & {
    layout?: string;
    model?: LayoutModel<TPhoto>;
    render?: Render<TPhoto>;
    componentsProps?: ComponentsProps<TPhoto>;
};
declare const _default: <TPhoto extends Photo>(props: StaticPhotoAlbumProps<TPhoto> & ElementRef) => React.ReactNode;

export { _default as default };
export type { StaticPhotoAlbumProps };
