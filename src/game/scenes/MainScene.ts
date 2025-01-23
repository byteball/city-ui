// src/scenes/MapScene.ts
import Phaser from 'phaser';

import { RoadData } from '../objects/Road';
import { Map } from '../objects/Map';
import { Plot, HouseData } from '../objects/Plot';

import CameraController from '../controllers/CameraController';

export default class MapScene extends Phaser.Scene {
    private housesData: HouseData[] = [
        { city: 'City A', amount: 2.5, x: 1324, y: 6557, ts: 1734023072 },
        { city: 'City B', amount: 3.0, x: 5000, y: 8000, ts: 1734023073 },


        { city: 'City С', amount: 2.5, x: 2324, y: 6557, ts: 1734023072 },
        { city: 'City D', amount: 3.0, x: 500, y: 800, ts: 1734023073 },


        { city: 'City E', amount: 2.5, x: 1324, y: 6557, ts: 1734023072 },
        { city: 'City F', amount: 3.0, x: 5000, y: 6000, ts: 1734023073 },


        { city: 'City G', amount: 2.5, x: 1324, y: 6557, ts: 1734023072 },
        { city: 'City H', amount: 3.0, x: 9000, y: 4000, ts: 1734023073 },


        { city: 'City 1', amount: 1.5, x: 1324, y: 1557, ts: 1734023072 },
        { city: 'City 2', amount: 2.0, x: 2000, y: 2000, ts: 1734023073 },
        { city: 'City 3', amount: 3.5, x: 3324, y: 3557, ts: 1734023072 },
        { city: 'City 4', amount: 4.0, x: 4000, y: 4000, ts: 1734023073 },
        { city: 'City 5', amount: 5.5, x: 5324, y: 5557, ts: 1734023072 },
        { city: 'City 6', amount: 6.0, x: 6000, y: 6000, ts: 1734023073 },
        { city: 'City 7', amount: 7.5, x: 7324, y: 7557, ts: 1734023072 },
        { city: 'City 8', amount: 8.0, x: 8000, y: 8000, ts: 1734023073 },
        { city: 'City 9', amount: 9.5, x: 9324, y: 9557, ts: 1734023072 },
        { city: 'City 10', amount: 10.0, x: 10000, y: 10000, ts: 1734023073 },


        { city: 'City 1', amount: 1, x: 1324, y: 1557, ts: 1734023072 },
        { city: 'City 2', amount: 2, x: 5000, y: 2000, ts: 1734023073 },
        { city: 'City 3', amount: 3, x: 3324, y: 3557, ts: 1734023072 },
        { city: 'City 4', amount: 4, x: 4000, y: 4000, ts: 1734023073 },
        { city: 'City 5', amount: 5, x: 2324, y: 7557, ts: 1734023072 },
        { city: 'City 6', amount: 6, x: 1000, y: 6000, ts: 1734023073 },
        { city: 'City 7', amount: 7, x: 7324, y: 2557, ts: 1734023072 },
        { city: 'City 8', amount: 8, x: 4000, y: 3000, ts: 1734023073 },
        { city: 'City 9', amount: 9, x: 3324, y: 9557, ts: 1734023072 },
        { city: 'City 10', amount: 10, x: 1000, y: 10000, ts: 1734023073 }

    ];

    private roadsData: RoadData[] = [
        { x1: 2000, y1: 2000, x2: 2000, y2: 5000, name: "Tonych Avenue", avenue: true },
        { x1: 2000, y1: 8000, x2: 7000, y2: 8000, name: "Taump Street", avenue: false },
    ];

    constructor() {
        super('MapScene');
    }

    preload() {
        // Загрузка ресурсов, если необходимо
    }

    create() {
        // Создаем карту
        const map = new Map(this, this.roadsData, this.housesData);
        map.createMap();

        // Инициализируем контроллер камеры
        new CameraController(this, this.cameras.main);
    }
}