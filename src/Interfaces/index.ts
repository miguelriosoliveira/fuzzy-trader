export interface CryptoProps {
	symbol: string;
	name: string;
	value: number;
	icon_url: string;
}

export interface StockProps {
	symbol: string;
	name: string;
	close: number;
	value: number;
}

export interface QuantityProps {
	[key: string]: number;
}
