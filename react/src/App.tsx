import { Route, Routes } from 'react-router-dom'
import Items from './pages/index'
import Form from './pages/form'
import Details from './pages/details'
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Items />} />
        <Route path='/form' element={<Form />} />
        <Route path='/details/:id' element={<Details />} />
      </Routes>
    </>
  )
}

export default App
