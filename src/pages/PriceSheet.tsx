export const PriceSheet = () => {
  
    return (
    <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
          <div className="text-white text-4xl font-bold ml-4">PRICE SHEET</div>
        </div>
        <div className="bg-gray-400 px-1 py-0.5 shadow-sm mb-2">
          <span className="ml-2 text-gray-700">This page's prices are used to calculate processing invoices</span>
        </div>
        <div className="px-4 mt-4 h-full overflow-y-scroll">
          <PriceEntry name="something" currentPrice={10}/>
        </div>
      </div>
    )
}

const PriceEntry = ({ name, currentPrice }: {name: String, currentPrice: number}) => {
    return (
        <div>{name} ${currentPrice}</div>
    )
}