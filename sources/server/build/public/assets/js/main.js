class SearchBox{
    searchBox = document.querySelector('.search-box');
    searchInput = this.searchBox.querySelector('input');
    searchIcon = this.searchBox.querySelector('.search-box__search-icon');
    refreshDataInput(){
        this.searchInput = document.querySelector('.search-box__search-icon');
    }
    focus(){
        return this.searchInput.focus();
    }
    search(){
        const value = document.querySelector('.search-box__search-input').value;
        return window.location = `#./search/${value}`;
    }
}
const searchBox = document.querySelector('.search-box');
if (searchBox){
    let initSearchBox = new SearchBox;
    searchBox.addEventListener('click', function (e){
        e.preventDefault();
        initSearchBox.focus();
    })
    initSearchBox.searchIcon.addEventListener("click",()=>{
        return initSearchBox.search()
    })
}


class Wallet {
    chainsAccepted = {
        100 : {
            network : "Gnosis",
            fullname : "Gnosis Mainnet",
            chainId : 100,
            currency : "xDAI",
            rpcUrl : 'https://rpc.gnosischain.com',
            blockExplorerUrls : 'https://gnosisscan.io' 
        },
        10200 : {
            network : "Chiado",
            fullname : "Chiado Testnet",
            chainId : 10200,
            currency : "xDAI",
            rpcUrl : 'https://rpc.chiadochain.net',
            blockExplorerUrls : 'https://blockscout.com/gnosis/chiado' 
        }
    };
    #defaultChain = 10200;
    #provider;
    #chainId;
    #signer;
    #contractAddress;
    #contractAbi;
    #contract;

    #isWalletConnected = false;
    #currencySymbol = "...";
    #walletBalance;
    #walletAddress;

    #connectWallet_buttons = document.querySelectorAll(".connect-wallet_btn");

    #walletContainer = document.querySelector(".wallet__container");

    constructor (){
    }
    
    get getWalletConnected(){
        // @return true if wallet is connected
        //return window.ethereum.isConnected();
        return this.#isWalletConnected;
    }

    walletList = {
        '' : {
            checkFuncReturn : false
        }
        ,
        "metamask" : {
            checkFuncReturn : !this.getWalletConnected && this.#checkMetaMask,
            provider : window.ethereum
        }
    }

    /**
     * @dev
     * @returns object contain balance and currency symbol
     */
    get getBalanceInfo(){
        return { balance : this.#walletBalance, symbol : this.#currencySymbol}
    }

    get #checkMetaMask(){
        // @return true if user is already download Metamask
        return !!window.ethereum && window.ethereum.isMetaMask;
    }

    get getWalletAddress(){
        return this.#walletAddress;
    }

    get getButtons(){
        return this.#connectWallet_buttons;
    }

    get getProvider(){
        return this.#provider;
    }

    get getSigner(){
        return this.#signer;
    }
    
    // ---------------------
    // SET
    set #setWalletConnected(bool){
        this.#isWalletConnected = bool;
    }

    set #setCurrencySymbol(symbol){
        this.#currencySymbol = symbol;
    }

    set #setWalletBalance(value){
        return this.#walletBalance = value;
    }

    #setSigner(){
        this.#signer = this.#provider.setSigner();
    }
    // ---------------------
    // Work function

    /**
     * @dev return true if connect success
     * @returns boolean
     */
    async connectWallet(wallet = ''){
        this.renderWalletConnectStatus(this.#connectWallet_buttons,0)
        if (!this.#connectProvider(wallet.toLowerCase())){
            console.log('Cannot connect to etherum node');
            return false;
        };
        return this.#provider
        .send("eth_requestAccounts",[])
        .then(async (walletAddress) => {
            const correctChain = await this.#configNetworkChain();
            if (!correctChain){
                this.renderWalletConnectStatus(this.#connectWallet_buttons,1)
                throw Error("Please check wallet!");
            }
            if (walletAddress[0] == this.#walletAddress){
                return true
            }
            this.#walletAddress = walletAddress[0];
            // login to be
            const isLogin = await this.login();
            if (!isLogin){
                this.#walletAddress = null;
                return this.renderWalletConnectStatus(this.#connectWallet_buttons,1)
            };
            this.#setWalletConnected = true;
            await this.#setContractInfo();
            console.log(isLogin);
            this.#setWalletBalance = await this.#fetchWalletBalance();
            this.walletEvent();
            // Render to HTML
            this.renderWalletConnectStatus(this.#connectWallet_buttons,1);
            this.renderWalletToHTML();
            console.log("Connect wallet success!", walletAddress);
            return true;
        }).catch((err) => {
            if (err.code === 4001){
                this.renderWalletConnectStatus(this.#connectWallet_buttons,1)
                console.log("Please connect to wallet.");
            }
            return false;
        });
    }

    async #setContractInfo(){
        if (!this.#isWalletConnected){
            return await this.login();
        }
        try {
            const r = await fetch(be + "/api/contract/info/v1", {
                method : "POST",
                credentials : "include"
            })
            const { abi, address } = await r.json();
            this.#contractAbi = abi;
            this.#contractAddress = address;
            this.#contract = new ethers.Contract(this.#contractAddress,
                this.#contractAbi, this.#signer);
            console.log(!!this.#contractAbi, this.#contractAddress);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
        
    }

    get contract(){
        return this.#contract
    }

    #connectProvider(wallet = ''){
        if (!this.walletList[wallet]){
            console.warn(`Sorry we don't support ${wallet} yet!`);
            return false;
        }
        if (!this.walletList[wallet].checkFuncReturn){
            console.warn(`Please install ${wallet}.`);
            return false;
        }
        this.#provider = new ethers.providers.Web3Provider(this.walletList[wallet].provider, "any");
        this.#signer = this.#provider.getSigner();
        return true;
    }
    
    async #fetchWalletBalance(){
        return this.#provider
        .getBalance(this.getWalletAddress)
        .then((r)=>{
            // set balance
            return ((parseInt(`${r._hex}`)/parseInt("1000000000000000000")).toFixed(3));
        })
        .catch(function (error){
            console.error(error);
            return 0;
            // maybe reload page
        })
    }
    
    async #configNetworkChain(){
        return this.#provider
        .getNetwork()
        .then((r)=>{
            if (!r.chainId) throw Error("We dont support this chain yet!");
            const id = this.chainsAccepted[r.chainId];
            if (!id){
                // request change network
                return this.#provider.send("wallet_switchEthereumChain", 
                [
                    {chainId : ethers.utils.hexValue(this.#defaultChain)}
                ])
                .then(()=>{
                    this.#setCurrencySymbol = this.chainsAccepted[this.#defaultChain].currency;
                    return true;
                })
                .catch((error)=>{
                    console.log(error);
                    if (error.code === 4001){
                        // user rejected
                        console.error(`Please connect to ${this.chainsAccepted[this.#defaultChain].fullname}!`);
                        throw Error(`Please connect to ${this.chainsAccepted[this.#defaultChain].fullname}!`);
                    }
                    if (error.code === 4902){
                        return this.#provider.send(
                            'wallet_addEthereumChain',
                            [
                                {
                                    chainId: window.ethers.utils.hexValue(this.#defaultChain),
                                    chainName: this.chainsAccepted[this.#defaultChain].network,
                                    rpcUrls: [this.chainsAccepted[this.#defaultChain].rpcUrl],
                                    nativeCurrency: { name : this.chainsAccepted[this.#defaultChain].network , symbol : this.chainsAccepted[this.#defaultChain].currency, decimals : 18},
                                    blockExplorerUrls: [this.chainsAccepted[this.#defaultChain].blockExplorerUrls],
                                },
                            ],
                        ).then(()=>{
                            this.#setCurrencySymbol = this.chainsAccepted[r.chainId].currency;
                            return true;
                        })
                        .catch((error)=>{
                            if (error.code === 4001){
                                // user rejected
                                console.error(`Please connect to ${this.chainsAccepted[this.#defaultChain].fullname}!`);
                                throw Error(`Please connect to ${this.chainsAccepted[this.#defaultChain].fullname}!`);
                                
                            }
                            return false;
                        })
                    }
                })
            }
            this.#setCurrencySymbol = this.chainsAccepted[r.chainId].currency;
            return true;
        })
        .catch((error)=>{
            console.error(error);
            return false;
        })
    }
    async login(){
        const be = "https://be-poppam.onrender.com"
        try {
            let r = await fetch(be + '/auth/signUp', {
                method : "POST",
                credentials : 'include',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    publicAddress : this.getWalletAddress
                })
            });
            const { nonce } = await r.json();
            const s = await this.getSigner.signMessage(`Nonce : ${nonce}`);
            r = await fetch(be + '/auth/signIn',{
                method : "POST",
                credentials : 'include',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    publicAddress : this.getWalletAddress,
                    signature : s
                })
            })
            console.log(r);
            r = await r.json();
            if (r.code == 200) return true
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    walletEvent(){
        const walletAddress = document.querySelector(".wallet-address")
        walletAddress.onclick = function (){
            navigator.clipboard.writeText(walletAddress.textContent);
        }
        window.ethereum.on('chainChanged', async (networkChain)=>{
            const correctChain = await this.#configNetworkChain();
            if (!correctChain){
                this.renderWalletConnectStatus(this.#connectWallet_buttons,1)
                throw Error("Please check wallet!");
            }
            this.#setWalletBalance = await this.#fetchWalletBalance();
            console.log(this.getBalanceInfo);
            // Render to HTML
            this.renderWalletConnectStatus(this.#connectWallet_buttons,1);
            this.renderWalletToHTML();
            return true;
        })
        window.ethereum.on('accountsChanged', async (accounts)=>{
            this.renderWalletConnectStatus(this.#connectWallet_buttons,0)
            this.#setWalletConnected = true;
            if (!accounts[0]){ return window.location.reload()}
            this.#walletAddress = accounts[0];
            this.#setWalletBalance = await this.#fetchWalletBalance();
            console.log(this.getBalanceInfo);
            // Render to HTML
            this.renderWalletConnectStatus(this.#connectWallet_buttons,1);
            this.renderWalletToHTML();
            return true;
        });
    }
    // ---------------------
    // Render func
    renderWalletToHTML(){
        const bInfo = this.getBalanceInfo;
        console.log(bInfo.balance);
        this.#walletContainer.classList.add("is-login");
        document.querySelector(".account__menu").classList.add("is-login")
        document.querySelectorAll(".wallet-address").forEach((e)=>{
            e.textContent = this.#walletAddress;
        })
        document.querySelectorAll(".balance-box").forEach((e)=>{
            e.setAttribute("title", `${bInfo.balance} ${bInfo.symbol}`)
        })
        document.querySelectorAll('.wallet-balance').forEach(e=>{
            e.textContent = bInfo.balance;
        })
        document.querySelectorAll('.wallet-symbol').forEach(e=>{
            e.textContent = bInfo.symbol;
        })

    }

    renderWalletConnectStatus(element, status){
        element.forEach((e)=>{
            e.style.display = "block"
            e.onfocus = false;
            if (!status){
                element.innerText = "";
                const svg = 
                `
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" overflow="visible" fill="#4d4ba1" stroke="#4d4ba1"><defs><polygon id="loader" points="20,40 28,55 12,55" /></defs><use xlink:href="#loader" transform="rotate(0 50 50)"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0s" repeatCount="indefinite"></animate></use><use xlink:href="#loader" transform="rotate(45 50 50)"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.125s" repeatCount="indefinite"></animate></use><use xlink:href="#loader" transform="rotate(90 50 50)"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.25s" repeatCount="indefinite"></animate></use><use xlink:href="#loader" transform="rotate(135 50 50)"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.375s" repeatCount="indefinite"></animate></use><use xlink:href="#loader" transform="rotate(180 50 50)"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.5s" repeatCount="indefinite"></animate></use><use xlink:href="#loader" transform="rotate(225 50 50)"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.625s" repeatCount="indefinite"></animate></use><use xlink:href="#loader" transform="rotate(270 50 50)"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.75s" repeatCount="indefinite"></animate></use><use xlink:href="#loader" transform="rotate(315 50 50)"><animate attributeName="opacity" values="0;1;0" dur="1s" begin="0.875s" repeatCount="indefinite"></animate></use></svg>
                `
                e.innerHTML = svg;
                return 1;
            }
            e.innerHTML = "";
            e.textContent = "Connect wallet"
            e.style = ""
        })
        return 1;
    }

    // ---------------------
}
async function App() {
      
    class SongNode{// song data structure 
        /* example = {
            contractAddress : "0x000",
            artistAddress : "0x000",
            artistName : "",
            songName : "Just the Two of Us (feat. Bill Withers)",
            author : "Grover Washington, Jr.",
            url : "/assets/mp3/justthetwoofus.mp3"
        } */
        constructor(data){
            this.data = data;
            this.next = null;
            this.prev = null;
        }
    }

    class SongQueue{
        #tail;
        #head;
        #totalSongInQueue;
        #currentNodeSong;

        constructor(){
            this.#tail = null;
            this.#head = null;
            this.#totalSongInQueue = 0;
        }

        get #getHead(){
            return this.#head;
        }

        get #getLast(){
            return this.#tail;
        }

        getCurrentNodeSong(){
            if (this.#currentNodeSong == null){
                this.#currentNodeSong = this.#getLast;
            }
            return this.#currentNodeSong;
        }

        findAndGetSongByUrl(url){
            if (!this.#totalSongInQueue){
                return false;
            }
            let index = 0;
            let currentNode = this.#getLast;
            while (index < this.#totalSongInQueue){
                if (currentNode.data.url == url){
                    this.#currentNodeSong = currentNode;
                    return this.#currentNodeSong;
                }
                if (!currentNode.prev) return false;
                currentNode = currentNode.prev;
                index++;
            }
            // return result
            return false;
        }

        getPrevSong(){
            if (!this.#currentNodeSong || !this.#currentNodeSong.next){
                return false
            }
            this.#currentNodeSong = this.#currentNodeSong.next;
            return this.#currentNodeSong;
        }
        getNextSongOfQueue(){
            if (this.#currentNodeSong == null){
                this.#currentNodeSong = this.#getLast;
                return this.#currentNodeSong;
            }
            if (!this.#currentNodeSong.prev) return false;
            this.#currentNodeSong = this.#currentNodeSong.prev;
            return this.#currentNodeSong;
        }

        getRandomSongOfQueue(){
            if (!this.#totalSongInQueue){
                return false;
            }
            if (this.#totalSongInQueue == 1){
                return this.#getLast;
            }
            const rand = Math.floor(((Math.random()*100)% this.#totalSongInQueue + 1))
            let index = 0;
            let currentNode = this.#getLast;
            while (index < rand){
                if (!currentNode.prev) return false;
                currentNode = currentNode.prev;
                index++;
            }
            // check this random song is unique
            if (this.#currentNodeSong == currentNode){
                return this.getRandomSongOfQueue();
            }
            // return result
            console.log(this.#currentNodeSong);
            this.#currentNodeSong = currentNode;
            return this.#currentNodeSong;
        }

        async #fetchStatusSong(url){
            try {
                const status = await fetch(url, {
                    method : "GET"
                })
                if (!status.ok) return false;
                return true;
            } catch (error) {
                return false;
            }
        }

        async addSong(data){
            if (!data || !data.tokenURI || !await this.#fetchStatusSong(baseUriReplace(data.tokenURI))) return false;
            const node = new SongNode(data);
            if (this.isQueueEmpty){
                this.#tail = this.#head = node;
                this.#currentNodeSong = this.#tail
            }else{
                node.next = this.#head;
                this.#head.prev = node;
                this.#head = node;
            }
            this.#totalSongInQueue++;
            return this.#head;
        }

        async addOneSongToQueue(song){
            return await this.addSong(song);
        }

        async addPlaylistToQueue(playlist){
            let count = 0;
            for (const songId in playlist) {
                if (Object.hasOwnProperty.call(playlist, songId)) {
                    if (await this.addOneSongToQueue(playlist[songId])){
                        count++;
                    }
                }
            }
            return count;
        }

        repeatQueue(){
            if (this.isQueueEmpty) return false;
            this.#currentNodeSong = this.#getLast;
            console.log(this.#currentNodeSong);
            return this.#currentNodeSong;
        }

        get isQueueEmpty(){
            return this.#totalSongInQueue === 0;
        }

        get getTotalSong(){
            return this.#totalSongInQueue;
        }
    }

    class MusicPlayer{
        #playerElement = new Audio();
        #queue = new SongQueue();
        #songUrl;
        #prevSong;
        #nextSong;

        #repeated = 0; // 0 : no | 1 : repeat | -1 : repeat only 1
        #shuffle = 0; // 0 : off | 1 : on |
        #currentTime = 0;
        #endTime = 0;
        #volume = 1;
        #muted = 0;

        // UI
        #musicPlayerElement = document.querySelector("#music-player");
        #ui_progress = this.#musicPlayerElement.querySelector(".music-timeline .progress-bar");
        #ui_volumeProgress = this.#musicPlayerElement.querySelector(".music-setting .volume__progress-bar");
        #songThumbnailElement = this.#musicPlayerElement.querySelector(".music-poster img");
        #songNameElement = this.#musicPlayerElement.querySelector(".music-detail .title");
        #songAuthorElement = this.#musicPlayerElement.querySelector(".music-detail .music-by");

        constructor(){
            this.eventMusicPlayer();
        }

        async startApp(queue, currentTime = 0, url = '', volume = 1, shuffle = 0, repeated = 0, muted = 0){
            if (!queue || !queue.getTotalSong) return false;
            this.#queue = queue;
            this.#muted = muted;
            this.#volume = volume;
            this.#playerElement.volume = muted ? 0 : volume;
            this.ui_initVolumeProgress()
            this.#shuffle = shuffle;
            this.#repeated= repeated;
            const t = this.#musicPlayerElement.querySelector(".music-play-controls .repeat-btn");
            if (!this.#repeated){
                t.querySelector("svg:first-of-type").style.display = "none"
                t.querySelector("svg:last-of-type").style.display = "inline"
            }
            else if (this.#repeated == 1){
                t.querySelector("svg:first-of-type").style.display = "none"
                t.querySelector("svg:last-of-type").style.display = "inline"
                t.classList.add("btn--on")
            }else{
                t.querySelector("svg:first-of-type").style.display = "inline"
                t.querySelector("svg:last-of-type").style.display = "none"
                t.classList.add("btn--on");
            }
            const s = this.#musicPlayerElement.querySelector(".music-play-controls .shuffle-btn");
            if (this.#shuffle){
                s.classList.add("btn--on");
            }else{
                t.classList.remove("btn--on");
            }
            let song = this.#queue.findAndGetSongByUrl(url);
            this.#playerElement.currentTime = currentTime;
            if (!song){
                song = this.#queue.getCurrentNodeSong();
                this.#playerElement.currentTime = 0;
            }
            if (!song && !this.#repeated){
                return false;
            }
            this.#nextSong = !!song.prev;
            this.#prevSong = !!song.next;
            this.ui_previousAndNextButton();
            if (!song && this.#repeated == 1){
                // Listen again
                this.#queue.repeatQueue();
                this.nextSong(1);
                return true;
            }
            await this.ui_loadSong(song);
            this.#musicPlayerElement.classList.remove("off");
            return true;
        }

        get #getPlayerElement(){
            return this.#playerElement;
        }

        get getCurrentSong(){
            return this.#songUrl;
        }

        set #setSongUrl(url){
            this.#songUrl = url;
        }

        get getQueuePlaylist(){
            return this.#queue;
        }

        async play(){
            if (!this.#songUrl){
                const checkQueue = await this.nextSong(1)
                if (!checkQueue) return false;
                return true;
            }
            const t = this.#musicPlayerElement.querySelector(".play-btn");
            if (!this.#playerElement.paused){
                t.classList.remove("pause")
                this.#getPlayerElement.pause();
                return false;
            }
            t.classList.add("pause")
            this.#getPlayerElement.play()
            return true;
        }  

        async nextSong(init = 0){
            let nextSongNode = this.#shuffle && !this.#repeated 
            ? this.#queue.getRandomSongOfQueue()
            : this.#queue.getNextSongOfQueue();
            if (!nextSongNode && !this.#repeated){
                return 0;
            }
            this.#nextSong = !!nextSongNode.prev;
            this.#prevSong = !!nextSongNode.next;
            this.ui_previousAndNextButton();
            if (!nextSongNode && this.#repeated){
                // Listen again
                nextSongNode = this.#queue.repeatQueue();
            }
            await this.ui_loadSong(nextSongNode);
            if (!init)
                return this.play();
            return 1;
        }

        async prevSong(){
            let prevSongNode = this.#queue.getPrevSong();
            if (!prevSongNode){
                return 0;
            }
            this.#nextSong = !!prevSongNode.prev;
            this.#prevSong = !!prevSongNode.next;
            this.ui_previousAndNextButton();
            await this.ui_loadSong(prevSongNode);
            return this.play();
        }

        loadSongDuration(){
            return new Promise((resolve, reject)=>{
                this.#playerElement.addEventListener('loadedmetadata', ()=>{
                this.#endTime = this.#playerElement.duration
                this.#currentTime = this.#playerElement.currentTime;
                resolve(true);
                });
            });
        }
        // ---
        // event listener
        // update progress
        eventMusicPlayer(){
            // auto save
            const autoSaveSetting = ()=>{
                let songSetting = JSON.stringify({
                    currentTime : this.#currentTime,
                    url : this.#songUrl,
                    shuffle : this.#shuffle,
                    repeated : this.#repeated,
                    volume : this.#volume,
                    muted : this.#muted
                })
                window.localStorage.setItem("lastSetting", songSetting)
            }
            let autoSaveFunc = setInterval(autoSaveSetting, 3000)
            //clearInterval(autoSaveFunc);
            //
            // update progress
            this.#playerElement.addEventListener('timeupdate', (e)=>{
                this.#currentTime = this.#playerElement.currentTime;
                this.ui_updateProgress();
            });
            let volumeIcon = document.querySelector(".music-setting .volume-icon");
            let currentVolumeProgress = this.#ui_volumeProgress.querySelector(".volume__current-progress");
            let volumePointer = this.#ui_volumeProgress.querySelector(".pointer");
            let timePointer = this.#ui_progress.querySelector(".pointer");
            let playBtn = this.#musicPlayerElement.querySelector(".play-btn");
            let shuffleBtn = this.#musicPlayerElement.querySelector(".music-play-controls .shuffle-btn");
            // set volume progress
            volumeIcon.addEventListener('click',()=>{
                if (this.#muted){
                    this.#muted = 0;
                    this.#volume = !this.#volume ? 0.1 : this.#volume;
                    this.#playerElement.volume = this.#volume;
                    currentVolumeProgress.style.width = `${this.#volume*100}%`;
                    volumeIcon.classList.remove("muted");
                    if (this.#volume >= 0.5){
                        return volumeIcon.classList.add("loud");
                    }
                    return volumeIcon.classList.remove("loud");
                }
                this.#muted = 1;
                this.#playerElement.volume = 0;
                currentVolumeProgress.style.width = `${0}%`;
                return volumeIcon.classList.add("muted");
            })
            this.#ui_volumeProgress.addEventListener('click', (e)=>{
                if (e.target == volumePointer) return false;
                return this.ui_setVolumeProgress(e);
            });
            this.#ui_volumeProgress.addEventListener('mousedown', (e)=>{
                if (e.target == volumePointer) return false;
                return this.ui_setVolumeProgress(e);
            });
            // set progress
            this.#ui_progress.addEventListener('click', (e)=>{
                if (e.target == timePointer) return false;
                if (this.#songUrl)  return this.ui_setProgress(e);
            });
            this.#ui_progress.addEventListener('mousedown', (e)=>{
                if (e.target == timePointer) return false;
                if (this.#songUrl)  return this.ui_setProgress(e);
            });

            // end song
            this.#playerElement.addEventListener('ended', async ()=>{
                playBtn.classList.add("pause");
                if (this.#repeated == -1){
                    playBtn.classList.remove("pause");
                    this.#currentTime = 0;
                    this.#playerElement.currentTime = this.#currentTime;
                    this.#playerElement.play();
                    return -1;
                }
                playBtn.classList.remove("pause");
                this.nextSong()
                return 1;
            });

            // main controls func
            playBtn
            .addEventListener("click", async (e)=>{
                //return await this.play();
                const status  = await this.play();
                if (!status){
                    return clearInterval(autoSaveFunc);
                }
                return autoSaveFunc = setInterval(autoSaveSetting,3000);
            })
            //shuffle
            shuffleBtn
            .addEventListener("click",(e)=>{
                e.preventDefault();
                if (!this.#shuffle){
                    this.#shuffle = 1;
                }else{
                    this.#shuffle = 0;
                }
                this.ui_previousAndNextButton()
                shuffleBtn.classList.toggle("btn--on");
                return;
            })
            let repeatBtn = this.#musicPlayerElement.querySelector(".music-play-controls .repeat-btn")
            //repeated
            repeatBtn
            .addEventListener("click",(e)=>{
                e.preventDefault()
                this.ui_previousAndNextButton();
                if (!this.#repeated){
                    this.#repeated++;
                    repeatBtn.querySelector("svg:first-of-type").style.display = "none"
                    repeatBtn.querySelector("svg:last-of-type").style.display = "inline"
                    repeatBtn.classList.toggle("btn--on")
                }
                else if (this.#repeated == 1){
                    this.#repeated = -1;
                    repeatBtn.querySelector("svg:first-of-type").style.display = "inline"
                    repeatBtn.querySelector("svg:last-of-type").style.display = "none"
                }else{
                    this.#repeated = 0;
                    repeatBtn.querySelector("svg:first-of-type").style.display = "none"
                    repeatBtn.querySelector("svg:last-of-type").style.display = "inline"
                    repeatBtn.classList.toggle("btn--on");
                }
                this.ui_previousAndNextButton();
                return ;
            })
            
            let nextBtn = this.#musicPlayerElement.querySelector(".music-play-controls .next-btn")
            // skip btn
            nextBtn
            .addEventListener("click", async(e)=>{
                if (!this.#nextSong && !this.#shuffle){
                    if (!this.#nextSong && !this.#repeated) return false;
                }
                const status = await this.nextSong();
                if (!status){
                    this.#playerElement.currentTime = this.#endTime;
                }
                return status;
            })

            // prev btn
            let prevBtn = this.#musicPlayerElement.querySelector(".music-play-controls .previous-btn");
            prevBtn
            .addEventListener("click", async(e)=>{
                if (!this.#prevSong || this.#shuffle) return false;
                const status = await this.prevSong();
                if (!status){
                    this.#playerElement.currentTime = 0;
                }
                return status;
            })
        }

        // utils
        formatTime(input) {
            const hours = Math.floor(input / 3600);
            const minutes = Math.floor((input % 3600) / 60);
            const seconds = Math.round(input % 60);
            
            const formattedTime = hours > 0 ? hours.toString().padStart(2, '0') + ':' +
                                minutes.toString().padStart(2, '0') + ':' +
                                seconds.toString().padStart(2, '0')
                                : minutes.toString() + ':' +
                                seconds.toString().padStart(2, '0');
            return formattedTime;
        }
        //render HTML
        ui_initTime(){
            this.#musicPlayerElement.querySelector(".time-start").textContent = this.formatTime(this.#currentTime);
            this.#musicPlayerElement.querySelector(".time-end").textContent = this.formatTime(this.#endTime);
        }

        ui_updateProgress(){
            const percentWidth = (this.#currentTime / this.#playerElement.duration) * 100;
            this.#ui_progress.querySelector(".current-progress").style.width = `${percentWidth}%`;
            const t = this.formatTime(this.#currentTime);
            this.#musicPlayerElement.querySelector(".time-start").textContent = t;
        }

        ui_setProgress(e) {
            const width = e.offsetX;
            const progress = e.currentTarget;
            const progressBarWidth = (width / progress.clientWidth) * 100;
            this.#ui_progress.querySelector(".current-progress").style.width = `${progressBarWidth}%`;
            this.#playerElement.currentTime = (width * this.#endTime) / progress.clientWidth;
        }

        ui_initVolumeProgress (){
            const vI = document.querySelector(".music-setting .volume-icon");
            let progressBarWidth = this.#volume * 100;
            this.#ui_volumeProgress.querySelector(".volume__current-progress").style.width = `${progressBarWidth}%`;
            if (!this.#volume || this.#muted){
                this.#muted = 1;
                return vI.classList.add("muted");
            }
            if (this.#volume >= 0.5){
                return vI.classList.add("loud");
            }
            return vI.classList.remove("loud");
        }

        ui_setVolumeProgress(e) {
            const vI = document.querySelector(".music-setting .volume-icon");
            const width = e.offsetX;
            const vProgress = e.currentTarget;
            let progressBarWidth = (width / vProgress.clientWidth) * 100;
            this.#volume = width / vProgress.clientWidth;
            if (progressBarWidth <= 6){
                progressBarWidth = 0;
                this.#volume = 0;
            }else if(progressBarWidth >= 92){
                progressBarWidth = 100;
                this.#volume = 1;
            }
            this.#ui_volumeProgress.querySelector(".volume__current-progress").style.width = `${progressBarWidth}%`;
            if (!this.#volume || this.#muted){
                this.#muted = 1;
                vI.classList.add("muted");
            }
            if (!this.#muted){
                vI.classList.remove("muted");
            }
            if (this.#volume >= 0.5){
                vI.classList.add("loud");
                this.#muted = 0;
            }
            else {
                this.#muted = 0;
                vI.classList.remove("loud");
            }
            this.#playerElement.volume = this.#volume;
        }

        ui_previousAndNextButton(){
            if (this.#nextSong || this.#shuffle || this.#repeated){ // if has next song
                this.#musicPlayerElement.classList.remove("block-next");
            }else{
                this.#musicPlayerElement.classList.add("block-next");   
            }
            if (this.#prevSong && !this.#shuffle){ // if has prev song
                return this.#musicPlayerElement.classList.remove("block-prev");
            }
            return this.#musicPlayerElement.classList.add("block-prev")
        }

        async ui_loadSong(songNode){
            /* example = {
                tokenURI : "Qqdxxxx",
                artistAddress : "0x000",
                artistName : "",
                songName : "Just the Two of Us (feat. Bill Withers)",
                audio : "/assets/mp3/justthetwoofus.mp3",
                image : "/assets/",
                cover_image : "/asdsad",
                description : "hello"
                playlistName : "Test"
            } */
            const songStructure = songNode.data;
            if (!songNode || !songStructure) return false; 
            this.#songUrl = baseUriReplace(songStructure.audio);
            this.#playerElement.src = this.#songUrl;
            this.#songAuthorElement.textContent = !songStructure.artistName ? songStructure.artistAddress : songStructure.artistName;
            this.#songAuthorElement.setAttribute("href", `/artist/${songStructure.artistAddress}`);
            this.#songNameElement.textContent = songStructure.name;
            this.#songNameElement.setAttribute("href", `/song/${songStructure.tokenURI}`)
            this.#songThumbnailElement.setAttribute("src", `${baseUriReplace(songStructure.image)}`); 
            this.loadSongDuration().then(()=>{
                this.ui_initTime();
                this.createMediaSession(songStructure)
                return true;
            })
            .catch(error=>{
                console.log(error);
                return false;
            })
        }

        createMediaSession(songData){
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: songData.name,
                    artist: songData.artistAddress,
                    album: songData.playlistName || "",
                    artwork: [
                        { src: baseUriReplace(songData.image)},
                        { src: baseUriReplace(songData.cover_image)},
                    ]
                });
            }
            const actionHandlers = [
                ['play', async () => {
                    return await this.play();
                }],
                ['pause', async () => {
                    return await this.play();
                }],
                ['previoustrack', async () => {
                    if (!this.#prevSong || this.#shuffle){
                        this.#playerElement.currentTime = 0;
                        return false;
                    };
                    const status = await this.prevSong();
                    if (!status){
                        this.#playerElement.currentTime = 0;
                    }
                    return status;
                }],
                ['nexttrack', async () => { 
                    if (!this.#nextSong && !this.#shuffle){
                        return false;
                    };
                    const status = await this.nextSong();
                    if (!status){
                        this.#playerElement.currentTime = 0;
                    }
                    return status;
                }],
                ['stop', async ()=>{
                    return await this.play();
                }],
              ];
            for (const [action, handler] of actionHandlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (error) {
                    console.log(`The media session action "${action}" is not supported yet.`);
                }
            }
        }
    }
    const t = new MusicPlayer();
    const q = new SongQueue();
    //await q.addPlaylistToQueue(fakeAPIList);
    const oldSetting = JSON.parse(window.localStorage.getItem("lastSetting")) || false;
    if (oldSetting){
        t.startApp(q, oldSetting.currentTime, oldSetting.url, oldSetting.volume, oldSetting.shuffle, oldSetting.repeated)
    }else{
        t.startApp(q)
    }
    const CONTRACT_HELPERS = {
        createMuzSong : async function (artistAddress, uri, publish, fee = 0){
            try {
                const tx = await WalletClass.contract.createSong(artistAddress, uri, publish, { value : fee });
                const data = await tx.wait();
                const event = data.events.find(event => event.event === 'Transfer');
                const [from, to, tokenId] = event.args;
                const v = await fetch(be + "/api/song/verify", {
                    method : "POST",
                    credentials : "include",
                    headers : {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({
                        tokenUri : uri,
                        songId : tokenId.toNumber()
                    })
                })
                const {code, message} = await v.json();
                return {code, message};
            } catch (error) {
                console.log(error);
                return false;
            }
        },
        fetchAllToken : async function (){
            const totalURI = {};
            async function fetchURI(tokenId){
                try {
                    const uri = await WalletClass.contract.tokenURI(tokenId);
                    const ownerAddress = await WalletClass.contract.ownerOf(tokenId);
                    const r = await fetch("https://ipfs.io/ipfs/" + uri.split("//")[1], {
                        method : "GET"
                    })
                    const muz = await r.json();
                    muz["tokenURI"] = uri;
                    muz["artistAddress"] = ownerAddress;
                    totalURI[tokenId] = muz
                } catch (error) {
                    console.log(error);
                    return false;
                }
            }
            try {
                const totalTokenId = await WalletClass.contract.getTotalTokenId();
                console.log(totalTokenId);
                const fetchArray = []
                for (let i = 1; i <= totalTokenId.toNumber(); i++) {
                    fetchArray.push(fetchURI(i));
                }
                await Promise.all(fetchArray);
                return totalURI;
            } catch (error) {
                console.log(error);
                return false;
            }
        },
    }
    class Slider{
        #totalSlides = -1;
        #currentSlide = -1;
        #slider = document.querySelector(".slider");
        get getAllSlideNodes(){
            return document.querySelectorAll(".slider .slide-item");
        }
    
        setSliderBg = function() {
            const bgs = document.querySelectorAll(".slide-item");
            let referenceImage = document.querySelectorAll(".slide-poster");
          
            // create a canvas element (but don't add it to the page)
            let canvas = document.createElement("canvas");
          
            // make the canvas size the same as your image
            
          
            // create the canvas context
            let context = canvas.getContext('2d')
            bgs.forEach((bg,index)=>{
                canvas.width = referenceImage[index].offsetWidth
                canvas.height = referenceImage[index].offsetHeight
                context.drawImage(referenceImage[index],0,0);
                // usage your image reference to draw the image in the canvas
          
                // select a random X and Y coordinates inside the drawn image in the canvas
                // (you don't have to do this one, but I did to demonstrate the code)
                let randomX = Math.floor(Math.random() * (referenceImage[index].offsetWidth - 1) + 1)
                let randomY = Math.floor(Math.random() * (referenceImage[index].offsetHeight - 1) + 1)
            
                // THIS IS THE MOST IMPORTANT LINE
                // getImageData takes 4 arguments: coord x, coord y, sample size w, and sample size h.
                // in our case the sample size is going to be of 1 pixel so it retrieves only 1 color
                // the method gives you the data object which constains and array with the r, b, g colour data from the selected pixel
                let color = context.getImageData(randomX, randomY, 1, 1).data
                
                // use the data to dynamically add a background color extracted from your image
                bg.style.backgroundColor = `rgba(${color[0]} ${color[1]} ${color[2]} / 40%)`
            })
        }
    
        setOnSlideBg = function(element) {
            const bg = element;
            let referenceImage = document.querySelector(".slide-poster");
            referenceImage.crossOrigin = "anonymous"
          
            // create a canvas element (but don't add it to the page)
            let canvas = document.createElement("canvas");
          
            // make the canvas size the same as your image
            canvas.width = referenceImage.offsetWidth
            canvas.height = referenceImage.offsetHeight
            canvas.cross
            // create the canvas context
            let context = canvas.getContext('2d')
                
            context.drawImage(referenceImage,0,0);
            // usage your image reference to draw the image in the canvas
        
            // select a random X and Y coordinates inside the drawn image in the canvas
            // (you don't have to do this one, but I did to demonstrate the code)
            let randomX = Math.floor(Math.random() * (referenceImage.offsetWidth - 1) + 1)
            let randomY = Math.floor(Math.random() * (referenceImage.offsetHeight - 1) + 1)
        
            // THIS IS THE MOST IMPORTANT LINE
            // getImageData takes 4 arguments: coord x, coord y, sample size w, and sample size h.
            // in our case the sample size is going to be of 1 pixel so it retrieves only 1 color
            // the method gives you the data object which constains and array with the r, b, g colour data from the selected pixel
            let color = context.getImageData(randomX, randomY, 1, 1).data
        
            // use the data to dynamically add a background color extracted from your image
            bg.style.backgroundColor = `rgba(${color[0]} ${color[1]} ${color[2]} / 40%)`
        }
    
        addSliderToTop = function (slideItem){
            if (!slideItem) return false;
            const Slider = document.querySelector(".slider");
            const currentSlides = Slider.innerHTML;
            Slider.innerHTML = slideItem.outerHTML + currentSlides;
            this.#totalSlides+=1;
            this.#currentSlide+=1;
            this.setOnSlideBg(slideItem);
            return true;
        }
    
        createNewSlideItem = function (
            coverImageUrl,
            posterImgUrl,
            typeOfNFT, 
            name, 
            description,
            tokenId, 
            artistAddress,
            artistName,
            playCount,
            loveCount,
            publishDate,
            copyright,
            soundRecordingCopyright = "2023 MUZIK3 Co., Ltd"
        ){
            const slideItem = document.createElement("div");
            slideItem.classList.add("slide-item");
            slideItem.innerHTML = (`
            <div class="poster-card">
                <div class="interact-poster">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M295-157v-652l512 326-512 326Z"/></svg>
                    </div>
                    <div class="love">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m479-87-58-52Q312-239 241.5-311.5T129-441.5q-42-57.5-58.5-105T54-643q0-101 67.5-169T289-880q56 0 104 24t86 71q44-50 90-72.5T669-880q101 0 169 68t68 169q0 49-16.5 96T831-442.5Q789-385 718-312T538-139l-59 52Z"/></svg>
                    </div>
                </div>
                <img class="slide-poster" src="${posterImgUrl}" alt="nft poster">
            </div>
            `)
            slideItem.innerHTML +=(`
            <div class="card-info">
                <span class="info type">${typeOfNFT}</span>
                <span class="info title">
                    <span class="name">${name}</span>
                    <span class="tokenid">#${tokenId}</span>
                </span>
                <span class="info artist">
                    <a href="/artist/${artistAddress}" class="artist-link">
                        Owner by: ${artistName}
                    </a>
                    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m343.609-52.348-77.435-132.391-153.87-31.717 17.478-149.631L32.108-480l97.674-112.913-17.478-149.87 153.87-31.478 77.435-133.391L480-844.696l136.63-62.956 78.196 133.391 152.87 31.478-17.478 149.87L927.891-480l-97.673 113.913 17.478 149.631-152.87 31.717L616.63-52.348 480-115.304 343.609-52.348ZM437-345.087 665.913-572l-47.152-42.913-181.761 180-94.761-99.239L294.087-487 437-345.087Z"/></svg>
                </span>
                <span class="info played-details">
                    <span class="detail play-count">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M295-157v-652l512 326-512 326Z"/></svg>
                        <span class="count-data">
                            ${playCount || 0} plays
                        </span>
                    </span>
                    <span class="detail love-count">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m479-87-58-52Q312-239 241.5-311.5T129-441.5q-42-57.5-58.5-105T54-643q0-101 67.5-169T289-880q56 0 104 24t86 71q44-50 90-72.5T669-880q101 0 169 68t68 169q0 49-16.5 96T831-442.5Q789-385 718-312T538-139l-59 52Z"/></svg>
                        <span class="count-data">
                            ${loveCount || 0} loves
                        </span>
                    </span>
                </span>
                <span class="info publishDate">
                    ${publishDate}
                </span>
                <span class="info description">
                    ${description || ""}
                </span>
                <span class="info cre">
                    <div class="copyright">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M387-311h181q19.825 0 29.912-11.8Q608-334.6 608-352v-80h-80v42h-97v-180h97v43h80v-80.701q0-18.449-10.088-29.874Q587.825-649 568-649H387q-18.825 0-27.413 12.237Q351-624.525 351-606v253q0 18.525 8.587 30.263Q368.175-311 387-311Zm92.679 252q-86.319 0-163.646-32.604-77.328-32.603-134.577-89.852-57.249-57.249-89.852-134.57Q59-393.346 59-479.862q0-87.41 32.662-164.275 32.663-76.865 90.203-134.412 57.54-57.547 134.411-90.499Q393.147-902 479.336-902q87.55 0 164.885 32.858 77.334 32.858 134.56 90.257 57.225 57.399 90.222 134.514Q902-567.257 902-479.458q0 86.734-32.952 163.382-32.952 76.648-90.499 134.2-57.547 57.551-134.421 90.214Q567.255-59 479.679-59Zm.092-91q136.742 0 233.485-96.387Q810-342.773 810-479.771q0-136.742-96.515-233.485Q616.971-810 479.729-810q-136.242 0-232.985 96.515Q150-616.971 150-479.729q0 136.242 96.387 232.985Q342.773-150 479.771-150ZM480-480Z"/></svg>
                        <span class="data">${copyright || "2023 MUZIK3 Co., Ltd"}</span>
                    </div>
                    <div class="copyright sound-recording-copyright">
                        <svg width='40' height='40' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#fff' opacity='0'/>
                            <g transform="matrix(1 0 0 1 12 12)" >
                            <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: #fff; fill-rule: nonzero; opacity: 1;" transform=" translate(-12, -12)" d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 9 7 L 9 17 L 11 17 L 11 13 L 13 13 C 14.256622 13 15.14058 12.106694 15.583984 11 L 16 11 L 16 10 C 16 8.3550302 14.64497 7 13 7 L 9 7 z M 11 9 L 13 9 C 13.56503 9 14 9.4349698 14 10 C 14 10.56503 13.56503 11 13 11 L 11 11 L 11 9 z" stroke-linecap="round" />
                            </g>
                        </svg>
                        <span class="data">${soundRecordingCopyright || "2023 MUZIK3 Co., Ltd"}</span>
                    </div>
                </span>
            </div>
            `)
            return slideItem;
        }
        
        nextSlide = () =>{
            const allSlides = this.getAllSlideNodes;
            const blurBg = document.querySelector("#main .blur-slide");
            if (this.#totalSlides==-1) return false;
            if (this.#currentSlide){
                allSlides[this.#currentSlide-1].style.visibility = "hidden";
                allSlides[this.#currentSlide-1].style.opacity = "0";
            }
            if (this.#currentSlide-1 == this.#totalSlides){
                this.#currentSlide = 0;
            }
            this.#currentSlide++;
            blurBg.style.backgroundImage = `url('${baseUriReplace(JSON.parse(allSlides[this.#currentSlide-1].dataset.uridata).cover_image)}')`;
            this.setOnSlideBg(allSlides[this.#currentSlide-1]);
            allSlides[this.#currentSlide-1].style.visibility = "visible";
            allSlides[this.#currentSlide-1].style.opacity = "1";
        }
    
        initSlider = async ()=>{
            CONTRACT_HELPERS.fetchAllToken()
            .catch((error)=>{
                console.log(error);
                return false;
            })
            .then( async (tokenList)=>{
                if (!t.getCurrentSong) t.startApp(q)
                await q.addPlaylistToQueue(tokenList);
                for (const id in tokenList) {
                    if (Object.hasOwnProperty.call(tokenList, id)) {
                        const {
                            cover_image,
                            name,
                            audio,
                            description,
                            image,
                            artistAddress,
                            tokenURI
                        } = tokenList[id];
                        if (cover_image){
                            console.log(cover_image);
                            const slide = this.createNewSlideItem(baseUriReplace(cover_image), baseUriReplace(image), "Single", name, description, id, artistAddress, artistAddress, 0,0, "");
                            slide.setAttribute("data-uridata", JSON.stringify(tokenList[id])); 
                            this.addSliderToTop(slide);
                        }
                    }
                }
            })
        }
    
        autoSlide = async ()=>{
            setInterval(() => {
                this.nextSlide();
            }, 5000);
        }
    }
    const WalletClass = new Wallet();
    const slider = new Slider();
    const connectButtons = document.querySelectorAll(".wallet-box");
    connectButtons.forEach(btn=>{
        btn.onclick = async function (e) {
            if(WalletClass.getWalletConnected) return true;
            if (await WalletClass.connectWallet('metamask')){
                slider.initSlider();
                slider.autoSlide();
            }
        } 
    })
}
const baseUriReplace = (uri)=>{
    return "https://ipfs.io/ipfs/"+uri.split("//")[1];
}
const fakeAPI = {artistAddress : "0x30d5E6707902733Fb76a915FbEf08A5c493afd33",tokenURI: "ipfs://Qmd15NsZCyJLnTjm4vtwwTpkFTCQ3TmxRyS4bWGeJECk9i",name: 'Calma (Cover by Tran Phat)', description: 'lyrics: asdas', image: 'ipfs://bafkreighww5gp575ywfp6gepuz7hc7du7ymoc57lzfakygj4oep3asxdgm', audio: 'ipfs://bafybeie4vqlu7daq54eaekpef2d2sxldswoz5dxs65muibrlllobflql2y', cover_image: 'ipfs://bafkreihv35ejyzqliqfve2w57xgyryd4uytdevrxnh6qwibwrlogn52an4'}

function openHeaderExpandMenu(){
    const expandContainer = document.querySelector(".expand__container");
    return expandContainer.querySelector(".expand-container__wrapper").classList.toggle("open-menu");
}
function loveMusic() {
    document.querySelector("#music-player .music-love").classList.toggle("love");
}
function openMenu(){
    document.querySelector(".menu-container__wrapper")
    .classList.toggle("open");
}
function openCreatedForm(){
    if (!WalletClass.getWalletConnected) return false;
    URL.revokeObjectURL(document.querySelector(".poster-preview").src);
    document.querySelector("#poster-file").files[0] = []
    const Form = document.getElementById("created-form");
    Form.querySelector(".title").textContent = "Create a new Music NFT .";
    Form.querySelector(".sub--title").textContent = "( Please choose your type )";
    Form.classList.remove("create");
    Form.classList.toggle("open");
}
function createAlbum(){
    const Form = document.getElementById("created-form");
    Form.querySelector(".title").textContent = "Create a new MUZ Album .";
    Form.querySelector(".sub--title").textContent = "( Please fill the fields )";
    Form.querySelector("#input-name").setAttribute("placeholder", "Your album name.")
    Form.querySelector("#input-description").setAttribute("placeholder", "Your album description.")
    Form.querySelector(".audio-upload").style.display = "none";
    Form.classList.add("create");
}
function createSong(){
    const Form = document.getElementById("created-form");
    Form.querySelector(".title").textContent = "Create a new MUZ Song .";
    Form.querySelector(".sub--title").textContent = "( Please fill the fields )";
    Form.querySelector("#input-name").setAttribute("placeholder", "Your song name.")
    Form.querySelector("#input-description").setAttribute("placeholder", "Your song description.")
    Form.querySelector(".audio-upload").style.display = "flex";
    Form.classList.add("create");
}
const be ="https://be-poppam.onrender.com";
async function createBtn(){
    if (!WalletClass.getWalletConnected) return WalletClass.connectWallet('metamask');
    const Form = document.getElementById("created-form");
    const type = Form.querySelector(".created").dataset.type;
    if (!type) return false;
    const name = Form.querySelector("#input-name").value;
    const description = Form.querySelector("#input-description").value;
    const publish = Form.querySelector("#publish-choose").checked;
    const formData = new FormData();
    if (type == "song"){
        const audio = document.querySelector("#audio-file").files[0]
        const poster = document.querySelector("#poster-file").files[0]
        const cover = document.querySelector("#cover-img-file").files[0]
        formData.append("cover_image", cover)
        formData.append("poster", poster);
        formData.append("audio", audio);
        formData.append("name", name);
        formData.append("publish", publish);
        formData.append("description", description);
    }else if (type == "album"){
        const poster = document.querySelector("#poster-file").files[0]
        formData.append("poster", poster);
        formData.append("name", name);
        formData.append("publish", publish);
        formData.append("description", description);
    }else{
        return false;
    }
    try {
        Form.querySelector(".created-btn").classList.add("loading");
        const r = await fetch(be + "/api/song/create", {
            method : "POST",
            credentials : "include",
            body : formData
        })
        const { cid, publish, code, message } = await r.json();
        if (code >= 400){
            Form.querySelector(".sub--title").textContent = message;
            return Form.querySelector(".created-btn").classList.remove("loading");
        }
        const status = await CONTRACT_HELPERS.createMuzSong(WalletClass.getWalletAddress, cid, publish, 0);
        if (!status || code >=400){
            Form.querySelector(".sub--title").textContent = message;
            return Form.querySelector(".created-btn").classList.remove("loading");
        }
        Form.querySelector(".created-btn").classList.remove("loading");
        openCreatedForm()
        return true;
    } catch (error) {
        console.log(error);
        Form.querySelector(".created-btn").classList.remove("loading");
        return false
    }
    
}
// image add
const imgInputs = document.querySelectorAll("#created-form input[type='file']");
imgInputs.forEach((e, index)=>{
    e.onchange = ()=>{
        const [file] = e.files;
        const a = document.querySelectorAll(".upload-file")[index];
        if (file && index !=2 ){
            const b = a.querySelector(".poster-preview");
            URL.revokeObjectURL(b.src);
            b.src = URL.createObjectURL(file);
            a.classList.add("preview");
            return 1;
        }
        a.querySelector(".audio-title").textContent = file.name;
        return 1;
    }
})
const sidebar = document.querySelector("#sidebar")
const expandPlaylist = sidebar.querySelector(".expand-playlist")
expandPlaylist.onclick = ()=>{
    return sidebar.classList.toggle("open");
}
App()