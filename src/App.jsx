import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import profile from "./utils/images/profile.jpg"



export default function App() {

  const contractABI = abi.abi
  const contractAddress = "0x8d8A0c1F9924748242b36879A55B482906D6B0b1"

  const [currentAccount, setCurrentAccount] = useState("")
  const [allWaves, setAllWaves] = useState([])
  const [message, setMessage] = useState("")

  const handleChange =(e) => setMessage(e.target.value)

  const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
 
  const checkIfWalletIsConnected = async ()=>{

  try {
    const {ethereum} = window;

    !ethereum ? console.log("Make sure you have metamask!") : console.log("We have the ethereum object", ethereum);

//Request for all accounts in the ethereum object
    const accounts = await ethereum.request({method: "eth_accounts"});

    accounts.lenght !== 0 ?
      <> const account = accounts[0];
      console.log("Found an authorized account", account)
      setCurrentAccount(account)
      </> : console.log("No authorized account found")

      
    }
   catch (error) {
    console.log(error)
  }
  }
      


  //0xEf7951b3c74F6E77ED4be433d508667c9a7C112B

  //Connecting with Metamask
  const connectWallet = async () => {
    try {
      const {ethereum} = window
      if(!ethereum){
        alert("Get Metamask!");
        return;
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"})
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
    
  }

  //Grap the Wave function
  const wave =async ()=>{
    try {
      const {ethereum} = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
//Get the Current totalwaves from the contract
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber())

        //Call the wave function from our contract
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
       // console.log(message)
        console.log("Minning...", waveTxn.hash)
        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash)
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber())
        window.location.reload()
        
      } else{
         console.log("Ethereum Object doesn't exist")
      }
     
    } catch (error) {
      console.log(error)
    }
  }

   useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <img src={profile} alt="Profile" className="Profile"/>
        👋 Hey there!
        </div>

        <div className="bio">
        I am Litmus and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and send a message!
        </div>

        {
          !currentAccount ? (
            <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
            
          ) :  <>
          <textarea className="textArea" placeholder= "Type a Message" value={message} name="message" rows="4" cols="50" onChange={handleChange}>

</textarea>
          <button className="waveButton" onClick={wave}>
          Say Hi 😍
        </button>
            
        </>
        }
    
        {
          allWaves.map((wave, index) =>{
            return(
              
              <div key={index} style={{backgroundColor: "OldLace", marginTop: '16px', padding: "8px"}}>
                {console.log(wave)}
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          })
        }
       
        
      </div>
    </div>
  );
}
