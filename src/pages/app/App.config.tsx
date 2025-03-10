import React from 'react';
import { Home } from '../home/Home';
import { Avatar } from '../avatar/Avatar';
import { Tree } from '../tree/Tree';
import { Poster } from '../poster/Poster';
import { Loading } from '../loading/Loading';
import { Wall } from '../wall/Wall';
import { Social } from '../social/Social';

export enum PageType {
    Loading = 'loading',
    Home = 'home',
    Avatar = 'avatar',
    Tree = 'tree',
    Poster = 'poster',
    About = 'about',
    Wall = 'wall',
    Social = 'social',
}

export const PageBadges = [
    PageType.Home,
    PageType.Avatar,
    PageType.Tree,
    PageType.Poster,
    PageType.About,
    PageType.Wall,
    PageType.Social,
];

export const CONTENT_PAGES = [
    {
        type: PageType.Loading,
        NavText: null,
        Content: <Loading />,
        dropdown: false,
    },
    {
        type: PageType.Home,
        NavText: <>Vision</>,
        Content: <Home />,
        dropdown: false,
    },
    {
        type: PageType.Social,
        NavText: <>News</>,
        Content: <Social />,
        dropdown: false,
    },
    {
        type: PageType.Avatar,
        NavText: <>Infra</>,
        Content: <Avatar />,
        dropdown: false,
    },
    {
        type: PageType.Tree,
        NavText: <>Econs</>,
        Content: <Tree />,
        dropdown: false,
    },
    {
        type: PageType.Poster,
        NavText: <>Editor</>,
        Content: <Poster />,
        dropdown: false,
    },
    {
        type: PageType.Wall,
        NavText: <>Partners</>,
        Content: <Wall />,
        dropdown: false,
    },
];
