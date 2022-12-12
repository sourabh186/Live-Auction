let takeBid = document.getElementById('takeBid');
  let bidIncr = ''
  let bidTiming = document.getElementById('bidTiming');
  let timeLeft = 20;
  let timer = setInterval(() => {
    if(timeLeft <= 0){
      clearInterval(timer);
      alert('Your time is up!!!');
      takeBid.setAttribute('disabled', true);
      document.getElementById('bidSubmit').disabled = true;
      takeBid.setAttribute('placeholder', 'Your time is up!!')
    }
    bidTiming.innerHTML = `${timeLeft} sec`;
    timeLeft--;
  }, 1000)
  // for(; i>0; i--){
  //   bidTiming.innerHTML = `${i} s`;
  // }
  // if(i <= 0 ){
  //   alert('Your time is now finished!!!')
  // }
  let showBid = document.getElementById('showBid');       //bid increment
  let bidAmnt = 50;
  let nxtBid = 50;
  let recentBid = document.getElementById('recentBid');

  let lsGet = JSON.parse(localStorage.getItem('bidIncr'))
  let bidPrice = document.getElementById('bidPrice');        // current price
  bidPrice.innerHTML = `Rs. ${bidAmnt}`
  showBid.innerHTML = `Rs. ${bidAmnt}`
  takeBid.addEventListener('change', (e)=>{
    bidIncr = e.target.value
    if(bidIncr > bidAmnt){
      recentBid.innerHTML = bidIncr;
      nxtBid += Number(bidIncr);
      localStorage.setItem('bidIncr', JSON.stringify(nxtBid))
      bidPrice.innerHTML = `Rs. ${nxtBid}`;
    }else {
      alert('Your bid is too low....');
    }
    // if(bidIncr > bidAmnt){
    //   if(lsGet < Number(bidIncr)){
    //     localStorage.setItem('bidIncr', JSON.stringify(bidIncr))
    //     bidAmnt = bidIncr
    //     bidPrice.innerHTML = `Rs. ${bidIncr}`
    //   }else {
    //     alert('You bid amount is lower than present bid amount. Please Increase your bid amount...')
    //   }
    // }else{
    //   alert('Your bid amount is too low...')
    // }
    console.log(e.target.value);
    e.target.value = ''
  })
