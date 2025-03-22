import './App.css'
  import Iridescence from './blocks/Backgrounds/Iridescence/Iridescence.tsx';

function App() {

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-7xl font-bold text-green-500">blockchAIn</h1>
        <Iridescence
          color={[1, 1, 1]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
    </>
  )
}

export default App
