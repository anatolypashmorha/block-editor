import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import {BEditorContainer} from "./beditor/beditor.tsx";



function App() {

  return (
      <DndProvider backend={HTML5Backend}>
          <>
              <BEditorContainer/>
          </>
      </DndProvider>
  )
}

export default App
