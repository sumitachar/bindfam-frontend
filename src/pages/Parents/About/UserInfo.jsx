import React from 'react'

const UserInfo = () => {
    const { selectedEntity, setSelectedEntity, user } = useContext(UserContext);
  return (
    <div>
      <h1> Hello About</h1>
    </div>
  )
}

export default UserInfo
