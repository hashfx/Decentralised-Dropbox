import DStorage from '../abis/DStorage.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client');
const projectId = 'process.env.PROJECTID';
const projectSecret = 'process.env.PROJECTSECRET';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// leaving out the arguments will default to these values
const ipfs = ipfsClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
})

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    //Setting up Web3
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    //Declare Web3
    const web3 = window.web3

    //Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    //Network ID
    const networkId = await web3.eth.net.getId().then(console.log)
    const networkData = DStorage.networks[networkId]

    //IF got connection, get data from contracts
    console.log("Working..." + networkId + " " + networkData)
    if (networkData) {
      //Assign contract
      const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address)
      this.setState({ dstorage })
      //Get files amount
      // console.log("Getting files amount: " + await dstorage.methods.getFilesAmount().call())  // not a function error
      const filesCount = await dstorage.methods.fileCount().call()
      this.setState({ filesCount })
      console.log("Files count: " + filesCount)
      //Load files&sort by the newest
      for (var i = filesCount; i >= 1; i--) {
        const file = await dstorage.methods.files(i).call()
        this.setState({
          files: [...this.state.files, file]
        })
      }
      //Else
    } else {
      //alert Error
      window.alert('DStorage contract not deployed to detected network.')
      console.log('DStorage contract not deployed to detected network.')
    }

  }

  // Get file from user
  captureFile = event => {
    event.preventDefault()  // prevent default behavior of form

    const file = event.target.files[0]  // get file from file field
    const reader = new window.FileReader()  // native file reader

    reader.readAsArrayBuffer(file)  // convert to a buffer
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name
      })
      console.log('buffer', this.state.buffer)
    }
  }


  //Upload File
  uploadFile = description => {

    console.log("Submitting file to IPFS...")

    //Add file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS result', result)
      //Check If error
      if (error) {
        //Return error
        console.error(error)
        return
      }

      //Set state to loading
      this.setState({ loading: true })

      //Assign value for the file without extension
      if (this.state.type === '') {
        this.setState({ type: 'none' })
      }


      //Call smart contract uploadFile function
      console.log(result[0].hash, result[0].size, this.state.type, this.state.name, description)
      this.state.dstorage.methods.uploadFile(result[0].hash, result[0].size, this.state.type, this.state.name, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        // this.state.dstorage.methods.uploadFile(result[0].hash, result[0].size, this.state.type, this.state.name, description).send({ from: this.state.account }).on('transactionHash', (hash) => {  // TODO on('transactionHash')
        this.setState({
          loading: false,
          type: null,
          name: null
        })

        window.location.reload()
      }).on('error', (e) => {
        window.alert('Error')
        this.setState({ loading: false })
      })
    })

  }

  //Set states
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      dstorage: null,
      files: [],
      loading: false,
      type: null,
      name: null
    }
    //Bind functions
    this.uploadFile = this.uploadFile.bind(this)
    this.captureFile = this.captureFile.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {
          this.state.loading
            ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
            : <Main
              files={this.state.files}
              captureFile={this.captureFile}
              uploadFile={this.uploadFile}
            />
        }
      </div >
    );
  }
}

export default App;