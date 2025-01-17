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
const VIEW_RADIUS = 2;

// Порог зума для переключения LOD (уровня детализации)
const LOD_THRESHOLD = 0.5;

// Тип, описывающий данные о чанке
type ChunkObject = {
    container: Phaser.GameObjects.Container | Phaser.GameObjects.Graphics;
    isDetail: boolean;
};

export default class MainScene extends Phaser.Scene {
    // В этом объекте будем хранить все подгруженные чанки
    private chunks: Record<string, ChunkObject> = {};

    constructor() {
        super({ key: 'MainScene' });
    }

    preload(): void {
        // Загрузим тайл 50×50, чтобы рисовать детальный вид
        this.load.svg('tile', '../assets/tile.svg');
    }

    create(): void {
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

        // Зум колесом мыши
        this.input.on('wheel', (pointer: Phaser.Input.Pointer,
            gameObjects: any,
            deltaX: number,
            deltaY: number,
            deltaZ: number) => {
            let newZoom = this.cameras.main.zoom - (deltaY * 0.001);
            newZoom = Phaser.Math.Clamp(newZoom, 0.1, 2);
            this.cameras.main.setZoom(newZoom);
        });

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
        const wantDetail = (zoom >= LOD_THRESHOLD);

        // Если чанка ещё нет — создаём
        if (!chunk) {
            this.chunks[chunkKey] = this.createChunk(cx, cy, wantDetail);
            return;
        }

        // Если есть, но уровень детализации не совпадает — пересоздаём
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