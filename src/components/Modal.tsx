import { Link } from 'react-router-dom'

function Modal({message, redirect} : {message: string, redirect: string}) {
  return (
      <div className='modal-cont'>
          {message}
          <Link to={redirect}>OK</Link>
    </div>
  )
}

export default Modal