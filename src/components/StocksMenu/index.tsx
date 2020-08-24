import React, { ChangeEvent } from 'react';

import classnames from 'classnames';

import { QuantityProps, StockProps } from '../../Interfaces';
import { currencyFormatter } from '../../utils/format';

interface Props {
	title: string;
	stocks: StockProps[];
	investValue: number;
	subtotal: number;
	quantityObject: QuantityProps;
	handleChangeQuantity: (max: number, symbol: string) => (e: ChangeEvent<HTMLInputElement>) => void;
}

const StocksMenu: React.FC<Props> = ({
	title,
	stocks,
	investValue,
	subtotal,
	quantityObject,
	handleChangeQuantity,
}) => {
	const longestSymbolAsset = [...stocks].sort((a, b) => b.symbol.length - a.symbol.length)[0];

	return (
		<div>
			<h3>{title}</h3>
			<pre>
				{stocks.map(({ symbol, value, name }) => {
					// naming is a difficult task...
					const x = investValue - subtotal + value * (quantityObject[symbol] || 0);
					const purchasable = x >= value;
					const max = Math.floor(x / value);
					const symbolFormatted = symbol.padEnd(longestSymbolAsset.symbol.length, ' ');
					const valueFormatted = currencyFormatter.format(value);

					return (
						<div key={symbol} className="line">
							<span title={name} className={classnames({ purchasable })}>
								{`[${symbolFormatted}] ${valueFormatted}`}
							</span>

							{purchasable && (
								<input
									type="number"
									min={0}
									max={max}
									value={quantityObject[symbol] || 0}
									onChange={handleChangeQuantity(max, symbol)}
								/>
							)}
						</div>
					);
				})}
			</pre>
		</div>
	);
};

export default StocksMenu;
