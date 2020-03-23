import React, { useEffect, useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import * as queryString from 'query-string'
import axios from 'axios'

export function LoginCallback() {
  const location = useLocation()
  let history = useHistory()
  const { code } = queryString.parse(location.search)
  let [ userData, setUserData ] = useState({
    email: '',
    name: '',
    username: ''
  })

  useEffect(() => {
    async function fetchData(code) {
      const { data } = await axios({
        url: `https://oauth2.googleapis.com/token`,
        method: 'post',
        data: {
          client_id: '774648009457-on61oomjuk44beuqaga91kf2ucbdetda.apps.googleusercontent.com',
          client_secret: 'h84anfNsebeVcsVyXLaQd2fN',
          redirect_uri: 'http://localhost:3000/auth/redirect',
          grant_type: 'authorization_code',
          code,
        },
      });
      console.log(data)

      const { data: fetchedUserData } = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      }); 
      setUserData({...userData, email: fetchedUserData.email, name: fetchedUserData.name})
      console.log(userData)
    }
    fetchData(code)
  }, [])

  async function handleSubmit() {
    const { data: { found: userExists } } = await axios.get(`http://localhost:8000/api/auth/check?username=${userData.username}`)
    console.log(userExists)
    if(!userExists) {
      const { data: { token: token }} = await axios({
        url: 'http://localhost:8000/api/auth/login',
        method: 'post',
        data: userData
      })
      localStorage.setItem('woyl-token',token)
      history.push('/home')
    }
  }
  
  return (
    <div>
      <label for='name'>Name</label>
      <input type='text' value={userData.name}></input>
      <label for='email'>Email</label>
      <input type='text' value={userData.email}></input>
      <label for='username'>Username</label>
      <input type='text' onChange={(e) => setUserData({...userData, username: e.target.value})} value={userData.username}></input>
      <button onClick={() => handleSubmit()}>Submit</button>
    </div>
  )
}