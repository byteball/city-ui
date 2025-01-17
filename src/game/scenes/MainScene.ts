import Phaser from 'phaser';

// === Константы ===
// Размер одной клетки (пикселей)
const TILE_SIZE = 50;

// Размер всей карты в клетках
const GRID_WIDTH = 10000;
const GRID_HEIGHT = 10000;

// Размер в клетках на один "чанк"
const CHUNK_SIZE = 100;
const CHUNK_PIXEL_SIZE = CHUNK_SIZE * TILE_SIZE;

// Насколько чанков подгружаем вокруг текущего экрана
const VIEW_RADIUS = 3;

// Тип, описывающий данные о чанке
type ChunkObject = {
    container: Phaser.GameObjects.Container | Phaser.GameObjects.Graphics;
    isDetail: boolean;
};

export default class MainScene extends Phaser.Scene {
    // В этом объекте будем хранить все подгруженные чанки
    private chunks: Record<string, ChunkObject> = {};

    /**
 * Вспомогательные пороги для гистерезиса:
 *  - ниже 0.45 → используем Low-LOD
 *  - выше 0.55 → используем High-LOD
 *  - между этими значениями оставляем прежнее состояние (не переключаемся).
 */
    private LOD_LOW_THRESHOLD: number = 0.25;
    private LOD_HIGH_THRESHOLD: number = 0.75;
    private lastGlobalDetail: boolean = false;

    constructor() {
        super({ key: 'MainScene' });
    }

    preload(): void {
        // Загрузим тайл 50×50, чтобы рисовать детальный вид
        this.load.svg('tile', '../assets/tile.svg', { width: 50, height: 50 });
    }

    create(): void {
        // Разрешаем много касаний:
        this.input.addPointer(2); // или больше, но нужно минимум 2 для pinch

        // Установим границы камеры (в пикселях) на всю карту
        this.cameras.main.setBounds(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);

        if (this.input.mouse) {
            this.input.mouse.disableContextMenu();
        }

        // Перетаскиваем камеру зажатой левой кнопкой мыши
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                let newScrollX = this.cameras.main.scrollX - (pointer.x - pointer.prevPosition.x);
                let newScrollY = this.cameras.main.scrollY - (pointer.y - pointer.prevPosition.y);

                // Получим текущий zoom
                const z = this.cameras.main.zoom;

                // Максимально допустимые scrollX/scrollY, чтобы не выйти за карту
                const maxScrollX = (GRID_WIDTH * TILE_SIZE) - (this.cameras.main.width / z);
                const maxScrollY = (GRID_HEIGHT * TILE_SIZE) - (this.cameras.main.height / z);

                // Обрежем координаты
                newScrollX = Phaser.Math.Clamp(newScrollX, 0, maxScrollX);
                newScrollY = Phaser.Math.Clamp(newScrollY, 0, maxScrollY);

                // Установим результат
                this.cameras.main.setScroll(newScrollX, newScrollY);
            }
        });
        this.input.on('pointermove', pointer => {
            console.log('pointer.x/y=', pointer.x, pointer.y);
        });
        this.input.on(
            'wheel',
            (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number, event: any) => {

                // Остановим стандартный скролл страницы:
                const domEvent = pointer.event as WheelEvent | undefined;
                if (domEvent) {
                    domEvent.preventDefault();
                    domEvent.stopPropagation();
                }

                // let newZoom = this.cameras.main.zoom - (deltaY * 0.001);
                // newZoom = Phaser.Math.Clamp(newZoom, 0.1, 2);
                // this.cameras.main.setZoom(newZoom);

                // if (!domEvent?.ctrlKey) return;

                // New:
                // if (Math.abs(deltaY) < 0.5) {
                //     // Игнорируем очень мелкие изменения, чтоб не дрожало
                //     return;
                // }

                // let newZoom = this.cameras.main.zoom - (deltaY * 0.005);
                // newZoom = Phaser.Math.Clamp(newZoom, 0.1, 1);
                // this.cameras.main.setZoom(newZoom);

                // // Поджимаем scrollX, scrollY:
                // const cam = this.cameras.main;
                // const maxScrollX = (GRID_WIDTH * TILE_SIZE) - (cam.width / cam.zoom);
                // const maxScrollY = (GRID_HEIGHT * TILE_SIZE) - (cam.height / cam.zoom);

                // cam.scrollX = Phaser.Math.Clamp(cam.scrollX, 0, maxScrollX);
                // cam.scrollY = Phaser.Math.Clamp(cam.scrollY, 0, maxScrollY);




                const camera = this.cameras.main;
                const oldZoom = camera.zoom;
                const screenCenterX = camera.width / 2;
                const screenCenterY = camera.height / 2;

                const oldWorldCenterX = (camera.scrollX + screenCenterX) / oldZoom;
                const oldWorldCenterY = (camera.scrollY + screenCenterY) / oldZoom;

                // const oldWorldX = pointer.worldX;
                // const oldWorldY = pointer.worldY;

                const oldWorldX = (pointer.x + camera.scrollX) / oldZoom;
                const oldWorldY = (pointer.y + camera.scrollY) / oldZoom;

                // 2. Считаем новый зум
                let newZoom = camera.zoom - (deltaY * 0.003);
                newZoom = Phaser.Math.Clamp(newZoom, 0.1, 2);
                camera.setZoom(newZoom);

                // 3. После изменения зума смотрим, куда теперь «указал» курсор
                // const newWorldX = pointer.worldX;
                // const newWorldY = pointer.worldY;


                // const newWorldX = (pointer.x + camera.scrollX) / camera.zoom;
                // const newWorldY = (pointer.y + camera.scrollY) / camera.zoom;

                // // 4. Считаем разницу (как сильно «уехала» точка под курсором)
                // const dx = newWorldX - oldWorldX;
                // const dy = newWorldY - oldWorldY;
                // console.log('dx/dy=', dx, dy);
                // // console.log('camera.scrollX, camera.scrollY', camera.scrollX, camera.scrollY);

                // // 5. Сдвигаем камеру так, чтобы точка под курсором осталась на месте
                // camera.scrollX -= dx;
                // camera.scrollY -= dy;
                // // console.log('After minus:', camera.scrollX, camera.scrollY);
                // // 6. Кламп, чтобы не выйти за карту
                // const maxScrollX = (GRID_WIDTH * TILE_SIZE) - (camera.width / camera.zoom);
                // const maxScrollY = (GRID_HEIGHT * TILE_SIZE) - (camera.height / camera.zoom);
                // camera.scrollX = Phaser.Math.Clamp(camera.scrollX, 0, maxScrollX);
                // camera.scrollY = Phaser.Math.Clamp(camera.scrollY, 0, maxScrollY);
                // console.log('pointer.worldX/Y', camera.scrollX, camera.scrollY);
                // console.log('pointer.worldX / pointer.worldY ', pointer.worldX / pointer.worldY );

                // Считаем "новые" мировые координаты центра
                const newWorldCenterX = (camera.scrollX + screenCenterX) / camera.zoom;
                const newWorldCenterY = (camera.scrollY + screenCenterY) / camera.zoom;

                // Сдвигаем камеру
                const dx = newWorldCenterX - oldWorldCenterX;
                const dy = newWorldCenterY - oldWorldCenterY;
                camera.scrollX -= dx;
                camera.scrollY -= dy;

                // camera.scrollX = Phaser.Math.Linear(camera.scrollX, newWorldCenterX, 0.2);
                // camera.scrollY = Phaser.Math.Linear(camera.scrollY, newWorldCenterY, 0.2);
            }
        );

        // При старте подгружаем чанки в зоне видимости
        this.loadVisibleChunks();
    }

    // Вызывается на каждом кадре
    update(time: number, delta: number): void {
        // Проверяем, какие чанки нужны и какие можно удалить
        this.loadVisibleChunks();
        this.unloadInvisibleChunks();
    }

    /**
     * Определяем, какие чанки попадают в видимую область (с запасом VIEW_RADIUS),
     * и подгружаем/обновляем их LOD.
     */
    private loadVisibleChunks(): void {
        const camera = this.cameras.main;

        // Границы видимой области (с учётом зума)
        const left = camera.scrollX;
        const right = camera.scrollX + camera.width / camera.zoom;
        const top = camera.scrollY;
        const bottom = camera.scrollY + camera.height / camera.zoom;

        // Индексы чанков, пересекающих экран
        const startChunkX = Math.floor(left / CHUNK_PIXEL_SIZE);
        const endChunkX = Math.floor(right / CHUNK_PIXEL_SIZE);
        const startChunkY = Math.floor(top / CHUNK_PIXEL_SIZE);
        const endChunkY = Math.floor(bottom / CHUNK_PIXEL_SIZE);

        for (let cy = startChunkY - VIEW_RADIUS; cy <= endChunkY + VIEW_RADIUS; cy++) {
            for (let cx = startChunkX - VIEW_RADIUS; cx <= endChunkX + VIEW_RADIUS; cx++) {
                // Проверка выхода за границы всей карты
                if (cx < 0 || cy < 0) continue;
                if (cx >= Math.ceil(GRID_WIDTH / CHUNK_SIZE)) continue;
                if (cy >= Math.ceil(GRID_HEIGHT / CHUNK_SIZE)) continue;

                this.updateChunkLOD(cx, cy, camera.zoom);
            }
        }
    }

    /**
     * Создаём или обновляем уровень детализации (LOD) чанка (cx, cy).
     */
    private updateChunkLOD(cx: number, cy: number, zoom: number): void {
        const chunkKey = `${cx}_${cy}`;
        const chunk = this.chunks[chunkKey];

        // 1. Определяем, хотим ли мы "High LOD" или "Low LOD" при таком зуме,
        //    используя правила гистерезиса.
        let wantDetail: boolean;

        if (this.lastGlobalDetail) {
            // Если мы *уже* в High, то опустимся в Low только если zoom < LOD_LOW_THRESHOLD
            if (zoom < this.LOD_LOW_THRESHOLD) {
                wantDetail = false;
                this.lastGlobalDetail = false;
            } else {
                wantDetail = true;
            }
        } else {
            // Если мы *уже* в Low, то поднимемся в High только если zoom > LOD_HIGH_THRESHOLD
            if (zoom > this.LOD_HIGH_THRESHOLD) {
                wantDetail = true;
                this.lastGlobalDetail = true;
            } else {
                wantDetail = false;
            }
        }

        // Если у вас не нужно общесценовое состояние, можете хранить "старый" LOD
        // для этого чанка, но тогда придётся усложнить код, следя за каждым чанком.
        // Проще один раз определить wantDetail глобально, а чанк пересоздавать,
        // если у него isDetail != wantDetail.

        // 2. Дальше логика, как и была:
        if (!chunk) {
            // чанк не существует — создаём
            this.chunks[chunkKey] = this.createChunk(cx, cy, wantDetail);
            return;
        }

        // Если есть, но LOD не совпадает — удаляем и пересоздаём
        if (chunk.isDetail !== wantDetail) {
            chunk.container.destroy(true);
            this.chunks[chunkKey] = this.createChunk(cx, cy, wantDetail);
        }
    }

    /**
     * Собственно создаём чанк: либо "низкая детализация" (один прямоугольник),
     * либо "высокая" (много тайлов).
     */
    private createChunk(cx: number, cy: number, detail: boolean): ChunkObject {
        let containerOrGraphics: Phaser.GameObjects.Container | Phaser.GameObjects.Graphics;

        const worldX = cx * CHUNK_PIXEL_SIZE;
        const worldY = cy * CHUNK_PIXEL_SIZE;

        if (!detail) {
            // --- НИЗКАЯ ДЕТАЛИЗАЦИЯ ---
            // Рисуем просто один большой квадрат, обозначающий чанк
            const g = this.add.graphics({ x: worldX, y: worldY });
            g.fillStyle(0x999999, 1);

            g.fillRect(0, 0, CHUNK_PIXEL_SIZE, CHUNK_PIXEL_SIZE);

            // (Дополнительно) можно обозначить рамку чанка для отладки
            g.lineStyle(4, 0xff0000);
            g.strokeRect(0, 0, CHUNK_PIXEL_SIZE, CHUNK_PIXEL_SIZE);

            containerOrGraphics = g;
        } else {
            // --- ВЫСОКАЯ ДЕТАЛИЗАЦИЯ ---
            // Рисуем 100×100 тайлов (каждый 50×50 px)
            const c = this.add.container(worldX, worldY);

            for (let y = 0; y < CHUNK_SIZE; y++) {
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    // Проверка выхода за край карты
                    if (cx * CHUNK_SIZE + x >= GRID_WIDTH) continue;
                    if (cy * CHUNK_SIZE + y >= GRID_HEIGHT) continue;

                    const tileX = x * TILE_SIZE;
                    const tileY = y * TILE_SIZE;

                    const tileSprite = this.add.image(tileX, tileY, 'tile');
                    tileSprite.setOrigin(0, 0); // чтобы (0,0) было в левом верхнем углу
                    c.add(tileSprite);
                }
            }

            containerOrGraphics = c;
        }

        return {
            container: containerOrGraphics,
            isDetail: detail
        };
    }

    /**
     * Удаляем из памяти невидимые чанки (и их объекты).
     */
    private unloadInvisibleChunks(): void {
        const camera = this.cameras.main;

        const left = camera.scrollX - (VIEW_RADIUS * CHUNK_PIXEL_SIZE);
        const right = camera.scrollX + (camera.width / camera.zoom) + (VIEW_RADIUS * CHUNK_PIXEL_SIZE);
        const top = camera.scrollY - (VIEW_RADIUS * CHUNK_PIXEL_SIZE);
        const bottom = camera.scrollY + (camera.height / camera.zoom) + (VIEW_RADIUS * CHUNK_PIXEL_SIZE);

        // Перебираем все загруженные чанки и проверяем, остаются ли они в зоне видимости
        for (const chunkKey in this.chunks) {
            const [cxStr, cyStr] = chunkKey.split('_');
            const cx = parseInt(cxStr, 10);
            const cy = parseInt(cyStr, 10);

            const chunkPxX = cx * CHUNK_PIXEL_SIZE;
            const chunkPxY = cy * CHUNK_PIXEL_SIZE;

            // Проверяем пересечение с расширенной зоной (с учётом VIEW_RADIUS)
            const inHorizRange = (chunkPxX + CHUNK_PIXEL_SIZE >= left) && (chunkPxX <= right);
            const inVertRange = (chunkPxY + CHUNK_PIXEL_SIZE >= top) && (chunkPxY <= bottom);

            if (!inHorizRange || !inVertRange) {
                // Удаляем лишний чанк
                this.chunks[chunkKey].container.destroy(true);
                delete this.chunks[chunkKey];
            }
        }
    }
}