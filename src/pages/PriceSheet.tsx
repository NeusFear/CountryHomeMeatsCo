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
          <table className="table-auto border-collapse border-tomato-600">
            <thead>
              <tr className="bg-tomato-200 border-tomato-600 border-t border-l border-r rounded-t-md font-bold text-center">
                <th>BEEF</th>
                <th></th>
                <th></th>
              </tr>
              <tr className="border border-red-600 bg-tomato-100">
                <th>Description</th>
                <th>Price</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              <PriceEntry description="Slaughter Fee" currentPrice={75.00} unit="per Animal"/>
              <PriceEntry description="Processing Fee" currentPrice={1.00} unit="per Pound * Dressed Weight"/>
              <PriceEntry description="Make Patties" currentPrice={0.45} unit="per Pound"/>
              <PriceEntry description="Split into Halves" currentPrice={3.00} unit="per Half"/>
              <PriceEntry description="Divide Halves into Quaters" currentPrice={5.00} unit="per Quarter"/>
              <PriceEntry description="Extra Boning" currentPrice={0.20} unit="per Quarter"/>
              <PriceEntry description="Cut Stew Meat" currentPrice={0.50} unit="per Pound"/>
              <PriceEntry description="Bone and Tenderize Round Steaks" currentPrice={3.00} unit="per Pound"/>
              <PriceEntry description="Make Cubed Steaks" currentPrice={3.00} unit="per Half"/>
              <PriceEntry description="Bone Our Prime Rib" currentPrice={5.00} unit="per Half"/>
              <PriceEntry description="Bone out Loin" currentPrice={10.00} unit="per Half"/>
            </tbody>
          </table>

          <br />

          <table className="table-auto border-collapse border-tomato-600">
            <thead>
              <tr className="bg-tomato-200 border-tomato-600 border-t border-l border-r rounded-t-md font-bold text-center">
                <th>PORK</th>
                <th></th>
                <th></th>
              </tr>
              <tr className="border border-red-600 bg-tomato-100">
                <th>Description</th>
                <th>Price</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              <PriceEntry description="Slaughter Fee" currentPrice={50.00} unit="per Animal"/>
              <PriceEntry description="Slaughter Fee > 150lbs" currentPrice={10.00} unit="per Animal"/>
              <PriceEntry description="Processing" currentPrice={1.00} unit="Per Pound * Dressed Weight"/>
              <PriceEntry description="Cure" currentPrice={1.00} unit="Per Pound of Cured Meat"/>
              <PriceEntry description="Sausage" currentPrice={0.25} unit="per Pound of Sausage"/>
            </tbody>
          </table>
        </div>
      </div>
    )
}

const PriceEntry = ({ description, currentPrice, unit }: {description: String, currentPrice: number, unit: String}) => {
    return (
      <tr>
        <td className="border border-red-600 pl-2 pr-4">{description}</td>
        <td className="border border-red-600 w-20 text-right pr-4">${currentPrice.toFixed(2)}</td>
        <td className="border border-red-600 px-4">{unit}</td>
      </tr>
    )
}