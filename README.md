# MMM-upbit

![MMM-upbit.png](/MMM-upbit.png)   

## Embedding MMM-upbit
``` JS
modules: [
	{
		module: 'MMM-upbit',
		position: 'bottom_bar',
		config: {
			codes: {
				"KRW-BTC": {amount: 0.01, buy_In: 40000000},
				"KRW-ETH": null,
				// "KRW-ETC": {amount: 5.555555, buy_In: 9000},
				// "KRW-GRS": {amount: 142.85714285, buy_In: 350},
				// "KRW-XEM": {amount: 179.21146953, buy_In: 279}
			}
		}
	},
]
```

## Configuration
```JS
codes : { 암호화폐 종목: {amount: 매수수량, buy_In: 매수가} }
```

**암호화폐 종목** 은 "**기준통화-코인이름**"의 패턴을 입력합니다.   
ex) BTC 마켓의 ETH -> "BTC-ETH"   
    KRW 마켓의 BTC -> "KRW-BTC"