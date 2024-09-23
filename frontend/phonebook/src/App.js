import { useState, useEffect } from 'react'
import personsService from './services/persons'
import Person from './components/Person'
import Notification from './components/Notification'
import Error from './components/Error'
import './index.css'

const Filter = (props) =>{
    return(
    <div>
      Filter shown with  
      <input
        value={props.value}
        onChange={props.onChange}
      /> 
    </div>
  )
}

const PersonForm = (props) =>{
  return(
      <form onSubmit={props.addPerson}>
        <div>
          name: 
        <input
          value={props.name.newName}
          onChange={props.name.handleNameChange}
        /> 
        </div>
        <div>
          number: 
        <input
          value={props.number.newNumber}
          onChange={props.number.handleNumberChange}
        /> 
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterUsed, setFilter] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber,
      id: `${persons.length + 1}`
    }
  
    const alreadyContains = persons.find(
      (e) => e.name === personObject.name);

    if(alreadyContains){
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)){
        updatePerson(alreadyContains)
      }
    }else{
      personsService
      .create(personObject)
      .then(returnedPerson =>{

        setSuccessMessage(
          `Added ${personObject.name} `
        )
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)


        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
    }
  }

  const updatePerson = (newPerson) => {
    const changedPerson = { ...newPerson, number: newNumber }
  

    personsService
      .update(newPerson.id, changedPerson)
      .then(returnedPerson =>{

        setSuccessMessage(
          `Changed ${returnedPerson.name}'s number to ${changedPerson.number} `
        )
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)


        setPersons(persons.map(person => person.id !== newPerson.id ? person : returnedPerson))
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        setErrorMessage(
          `Information of ${newPerson.name} has already been removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setPersons(persons.filter(person => person.id !== newPerson.id))
      })
  }

  const deletePerson = (id) => {
    const personToDelete = persons.find(person => person.id === id)
    if (window.confirm(`Delete ${personToDelete.name}`)) {
    
      personsService
      .deletePerson(id)
      .then(returnedPersons => {
        console.log(returnedPersons)
        setPersons(persons.filter(person => person.id !== id))
      })
    }
  }

  const handleNameChange = (event) => { 
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => { 
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => { 
    setFilter(event.target.value)
  }
  
   const peopleToShow = (filterUsed === '')
     ? persons
     : persons.filter(person => person.name.includes(filterUsed))


  return (
    <div>
      <h1>Phonebook</h1>
      
      <Notification message={successMessage} />
      <Error message={errorMessage} />

      <Filter value={filterUsed} onChange={handleFilterChange}/>

      <h2>Add a new</h2>
      {/* <PersonForm onSubmit={addPerson} 
      name={[newName, handleNameChange]} 
      number={[newNumber, handleNumberChange]}
      /> */}
      
      <form onSubmit={addPerson}>
        <div>
          name: 
        <input
          value={newName}
          onChange={handleNameChange}
        /> 
        </div>
        <div>
          number: 
        <input
          value={newNumber}
          onChange={handleNumberChange}
        /> 
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>

      <h2>Numbers</h2>
      <ul>
        {peopleToShow.map(person =>
          <Person key={person.id} person={person} deletePerson={() => deletePerson(person.id)} />
        )}
      </ul>
    </div>
  )
}

export default App