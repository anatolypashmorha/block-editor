import {DropTargetMonitor, useDrag, useDrop} from "react-dnd";
import {create} from "zustand";
import {useEffect} from "react";


export const ItemTypes = {
    BLOCK: 'BLOCK',
    COLUMN: 'COLUMN',
    SECTION: 'SECTION',
    WRAPPER: 'WRAPPER',
}

export interface BEditorState {
    wrappersArray: string[],
    wrappers: Map<string, string[]>,
    sections: Map<string, string[]>,
    columns: Map<string, string[]>,

    loadState: (
        wrappersArray: string[],
        wrappers: Map<string, string[]>,
        sections: Map<string, string[]>,
        columns: Map<string, string[]>,
    ) => void
    getState: () => {
        wrappersArray: string[],
        wrappers: Map<string, string[]>,
        sections: Map<string, string[]>,
        columns: Map<string, string[]>,
    }

    addBlock: (block: string, toColumn: string, atIndex: number) => void
    moveBlock: (block: string, toColumn: string, atIndex: number) => void
    removeBlock: (block: string) => void

    addColumn: (column: string, toSection: string) => void
    removeColumn: (column: string) => void

    addSection: (section: string, toWrapper: string, atIndex: number, sectionColumns: string[]) => void
    removeSection: (section: string) => void
    moveSection: (section: string, toWrapper: string, atIndex: number) => void

    addWrapper: (wrapper: string, atIndex: number) => void
    removeWrapper: (wrapper: string) => void
    moveWrapper: (wrapper: string, atIndex: number) => void
}

export const useBEditorState = create<BEditorState>((set, get) => ({
    wrappersArray: [],
    wrappers: new Map(),
    sections: new Map(),
    columns: new Map(),

    loadState: (
        wrappersArray: string[],
        wrappers: Map<string, string[]>,
        sections: Map<string, string[]>,
        columns: Map<string, string[]>,
    ) => {
        set({ wrappersArray, wrappers, sections, columns })
    },
    getState: () => {
        return {
            wrappersArray: get().wrappersArray,
            wrappers: get().wrappers,
            sections: get().sections,
            columns: get().columns,
        }
    },

    addBlock: (block: string, toColumn: string, atIndex: number) => {
        const columns = get().columns
        const column = columns.get(toColumn)
        if (column) {
            column.splice(atIndex, 0, block)
            columns.set(toColumn, column)
            set({ columns })
        }
    },
    moveBlock: (block: string, toColumn: string, atIndex: number) => {
        const columns = get().columns
        for (const [key, value] of columns) {
            if (value.includes(block)) {
                value.splice(value.indexOf(block), 1)
                columns.set(key, value)
                break
            }
        }

        const column = columns.get(toColumn)
        if (column) {
            column.splice(atIndex, 0, block)
            columns.set(toColumn, column)
            set({ columns })
        } else {
            console.error(`Could not find column ${toColumn}`)
        }
    },
    removeBlock: (block: string) => {
        for (const [key, value] of get().columns) {
            if (value.includes(block)) {
                value.splice(value.indexOf(block), 1)
                get().columns.set(key, value)
                set({ columns: get().columns })
                return
            }
        }
    },

    addColumn: (column: string, toSection: string) => {
        const columns = get().columns
        columns.set(column, [])
        set({ columns })

        const sections = get().sections
        const section = sections.get(toSection)
        if (section) {
            section.push(column)
            sections.set(toSection, section)
            set({ sections })
        }
    },
    removeColumn: (column: string) => {
        // TODO: Ensure in UI that there is at least one column in a section
        const sections = get().sections
        for(const [key, value] of sections) {
            if (value.includes(column) && value.length > 1) {
                value.splice(value.indexOf(column), 1)
                sections.set(key, value)

                const columns = get().columns
                columns.delete(column)

                set({ sections, columns })
                return
            }
        }
    },

    addSection: (section: string, toWrapper: string, atIndex: number, sectionColumns: string[]) => {
        const columns = get().columns
        for (const column of sectionColumns) {
            columns.set(column, [])
        }
        set({ columns })

        const sections = get().sections
        sections.set(section, sectionColumns)
        set({ sections })

        const wrappers = get().wrappers
        const wrapper = wrappers.get(toWrapper)
        if (wrapper) {
            wrapper.splice(atIndex, 0, section)
            wrappers.set(toWrapper, wrapper)
            set({ wrappers })
        }
    },
    removeSection: (section: string) => {
        const sections = get().sections
        const columns = get().columns
        const sectionColumns = sections.get(section)
        for(const column of sectionColumns || []) {
            columns.delete(column)
        }
        sections.delete(section)
        set({ sections, columns })

        const wrappers = get().wrappers
        for (const [key, value] of wrappers) {
            if (value.includes(section)) {
                value.splice(value.indexOf(section), 1)
                wrappers.set(key, value)
                set({ wrappers })
                return
            }
        }
    },
    moveSection: (section: string, toWrapper: string, atIndex: number) => {
        const wrappers = get().wrappers
        for(const [key, value] of wrappers) {
            if (value.includes(section)) {
                value.splice(value.indexOf(section), 1)
                wrappers.set(key, value)
                break
            }
        }

        const to = wrappers.get(toWrapper)
        if (to) {
            to.splice(atIndex, 0, section)
            wrappers.set(toWrapper, to)
        } else {
            console.error(`Could not find wrapper ${toWrapper}`)
        }
        set({ wrappers })
    },

    addWrapper: (wrapper: string, atIndex: number) => {
        const wrappers = get().wrappers
        const wrappersArray = get().wrappersArray
        wrappersArray.splice(atIndex, 0, wrapper)
        wrappers.set(wrapper, [])
        set({ wrappersArray, wrappers })
    },
    removeWrapper: (wrapper: string) => {
        const wrappers = get().wrappers
        const wrappersArray = get().wrappersArray

        const sections = get().sections
        const columns = get().columns
        const wrapperSections = wrappers.get(wrapper)
        for(const section of wrapperSections || []) {
            const sectionColumns = sections.get(section)
            for(const column of sectionColumns || []) {
                columns.delete(column)
            }
            sections.delete(section)
        }

        wrappersArray.splice(wrappersArray.indexOf(wrapper), 1)
        wrappers.delete(wrapper)
        set({ wrappersArray, wrappers, sections, columns })
    },
    moveWrapper: (wrapper: string, atIndex: number) => {
        const wrappers = get().wrappers
        const wrappersArray = get().wrappersArray
        wrappersArray.splice(wrappersArray.indexOf(wrapper), 1)
        wrappersArray.splice(atIndex, 0, wrapper)
        set({ wrappersArray, wrappers })
    }
}))

export const BEditorContainer = () => {
    const { loadState } = useBEditorState()

    useEffect(() => {
        loadState(
            ['wrapper1', 'wrapper2', 'wrapper3'],
            new Map([
                ['wrapper1', ['section1', 'section2']],
                ['wrapper2', ['section3']],
                ['wrapper3', ['section4']],
            ]),
            new Map([
                ['section1', ['column1', 'column2']],
                ['section2', ['column3']],
                ['section3', ['column4']],
                ['section4', ['column5', 'column6']],
            ]),
            new Map([
                ['column1', ['block1', 'block2']],
                ['column2', ['block3']],
                ['column3', ['block4']],
                ['column4', ['block5']],
                ['column5', ['block6']],
                ['column6', ['block7']],
            ]),
        )
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Container />
        </div>
    )
}

export const Container = () => {
    const state = useBEditorState

    const wrappersElements = state.getState().wrappersArray.map((wrapper) => <Wrapper key={wrapper} id={wrapper} />)

    const [, drop] = useDrop(() => ({
        accept: ItemTypes.WRAPPER,
        drop: (item: {id: string}, monitor: DropTargetMonitor) => {
            const { wrappersArray, moveWrapper } = state.getState()
            const containerDiv: HTMLDivElement | null = document.getElementById('container-for-wrappers') as HTMLDivElement | null
            if(containerDiv === null) return;

            const wrapperRect = containerDiv.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();

            if (!clientOffset) {
                console.error('Could not get client offset')
                return;
            }

            const relativeY = clientOffset.y - wrapperRect.top;

            // Calculate the most probable index based on the block heights and position
            let accumulatedHeight = 0;
            let atIndex = 0;

            for (let i = 0; i < wrappersArray.length; i++) {
                const wrapperDiv : HTMLDivElement | null = document.getElementById(wrappersArray[i]) as HTMLDivElement; // Assuming all blocks are of equal height
                if(wrapperDiv === null) continue;
                const wrapperHeight = wrapperDiv.getBoundingClientRect().height;
                accumulatedHeight += wrapperHeight;
                if (relativeY < accumulatedHeight) {
                    atIndex = i;
                    break;
                }
            }
            if(relativeY > accumulatedHeight) atIndex = wrappersArray?.length || 0;
            console.log(relativeY, accumulatedHeight, atIndex)

            moveWrapper(item.id, atIndex);
        },
    }));

    return (
        <div id={'container-for-wrappers'} ref={drop} style={{ display: 'flex', flexDirection: 'column' }}>
            {wrappersElements}
        </div>
    )
}

export const Wrapper = ({ id }: {id: string}) => {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ItemTypes.WRAPPER,
            item: { id },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id],
    );

    const { wrappers, moveSection } = useBEditorState()
    const wrapper = wrappers.get(id)
    const wrapperSections = wrapper?.map((section) => <Section key={section} id={section} />)

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.SECTION,
        // hover: (_item: {id: string}, monitor: DropTargetMonitor) => {
        //     console.log(id, monitor.getClientOffset())
        // },
        drop: (item: {id: string}, monitor: DropTargetMonitor) => {
            const wrapperDiv: HTMLDivElement | null = document.getElementById(id) as HTMLDivElement | null
            if(wrapperDiv === null) return;

            const wrapperRect = wrapperDiv.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();

            if (!clientOffset) {
                console.error('Could not get client offset')
                return;
            }

            const relativeY = clientOffset.y - wrapperRect.top;

            // Calculate the most probable index based on the block heights and position
            let accumulatedHeight = 0;
            let atIndex = 0;

            if (wrapper) {
                for (let i = 0; i < wrapper.length; i++) {
                    const sectionDiv : HTMLDivElement | null = document.getElementById(wrapper[i]) as HTMLDivElement; // Assuming all blocks are of equal height
                    if(sectionDiv === null) continue;
                    const sectionHeight = sectionDiv.getBoundingClientRect().height;
                    accumulatedHeight += sectionHeight;
                    if (relativeY < accumulatedHeight) {
                        atIndex = i;
                        break;
                    }
                }
            }
            if(relativeY > accumulatedHeight) atIndex = wrapper?.length || 0;

            moveSection(item.id, id, atIndex);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const ref = (element: HTMLDivElement) => {
        drag(element);
        drop(element);
    };

    return (
        <div
            ref={ref}
            id={id}
            style={{
                border: isOver? '1px solid #5e072e' : '1px dashed #5e072e66',
                padding: '0 0.3rem',
                margin: '0.3rem',
                backgroundColor: 'white',
                minHeight: '50px',
                opacity: isDragging ? 0.5 : 1,
                fontWeight: 'bold',
                cursor: 'move',
            }}
        >
            {wrapperSections}
        </div>
    )
}

const Section = ({ id }: {id: string}) => {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ItemTypes.SECTION,
            item: { id },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id],
    );

    const { sections } = useBEditorState()
    const section = sections.get(id)
    const sectionColumns = section?.map((column) => <Column key={column} id={column} />)

    return (
        <div
            ref={drag}
            id={id}
            style={{
                border: '1px dashed #fffe3466',
                margin: '0.3rem 0',
                padding: '0.3rem 0',
                backgroundColor: 'white',
                minHeight: '50px',
                opacity: isDragging ? 0.5 : 1,
                fontWeight: 'bold',
                cursor: 'move',
                display: 'flex',
                flexDirection: 'row',
            }}
        >
            {sectionColumns}
        </div>
    )
}

export const Column = ( {id}: {id: string}) => {
    const { columns, moveBlock } = useBEditorState()
    const column = columns.get(id)
    const blocks = column?.map((block) => <Block key={block} id={block} />)

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.BLOCK,
        // hover: (_item: {id: string}, monitor: DropTargetMonitor) => {
        //     console.log(id, monitor.getClientOffset())
        // },
        drop: (item: {id: string}, monitor: DropTargetMonitor) => {
            const columnDiv: HTMLDivElement | null = document.getElementById(id) as HTMLDivElement | null
            if(columnDiv === null) return;

            const columnRect = columnDiv.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();

            if (!clientOffset) {
                console.error('Could not get client offset')
                return;
            }

            const relativeY = clientOffset.y - columnRect.top;

            // Calculate the most probable index based on the block heights and position
            let accumulatedHeight = 0;
            let atIndex = 0;

            if (column) {
                for (let i = 0; i < column.length; i++) {
                    const blockDiv : HTMLDivElement | null = document.getElementById(column[i]) as HTMLDivElement; // Assuming all blocks are of equal height
                    if(blockDiv === null) continue;
                    const blockHeight = blockDiv.getBoundingClientRect().height;
                    accumulatedHeight += blockHeight;
                    if (relativeY < accumulatedHeight) {
                        atIndex = i;
                        break;
                    }
                }
            }
            if(relativeY > accumulatedHeight) atIndex = column?.length || 0;

            moveBlock(item.id, id, atIndex);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        <div
            ref={drop}
            id={id}
            style={{
                minWidth: '50px',
                minHeight: '50px',
                flexGrow: 1,
                border: isOver ? '1px solid #2196f3' : '1px dashed #327e4066',
                padding: 0,
                margin: '0 0.3rem',
                backgroundColor: 'white',
                fontWeight: 'bold',
                cursor: 'move',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {blocks}
        </div>
    )
}

export const Block = ({ id }: {id: string}) => {
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ItemTypes.BLOCK,
            item: { id },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [id],
    );

    return (
        <div
            ref={drag}
            id={id}
            style={{
                minWidth: '50px',
                minHeight: '50px',
                border: '1px dashed #2196f366',
                padding: '0.3rem 0.3rem',
                margin: '0.3rem',
                backgroundColor: 'white',
                opacity: isDragging ? 0.5 : 1,
                fontWeight: 'bold',
                cursor: 'move',
            }}
        >
            {id}
        </div>
    );
}
