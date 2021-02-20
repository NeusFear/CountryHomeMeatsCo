export const InvoiceDetailsPage = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">INVOICE</div>
      </div>
      <div className="flex-grow flex flex-col p-4">
        
        <div className="flex flex-row h-40">
            <div className="bg-gray-300 rounded-md shadow-md flex-grow">
                <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1 mb-2">Invoice Details</div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Date Paid:</p>
                    <p className="text-right">01-01-0001</p>
                </div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Time Paid:</p>
                    <p className="text-right">3:58 PM</p>
                </div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">How Paid:</p>
                    <p className="text-right">Card</p>
                </div>
            </div>
            <div className="bg-gray-300 rounded-md shadow-md flex-grow mx-4">
                <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1 mb-2">User Details</div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Name:</p>
                    <p className="text-right">Brandon Davis</p>
                </div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Phone Number:</p>
                    <p className="text-right">(405)496-8884)</p>
                </div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Email:</p>
                    <p className="text-right">33463davis@gmail.com</p>
                </div>
            </div>
            <div className="bg-gray-300 rounded-md shadow-md flex-grow">
                <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1 mb-2">Animal Details</div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Type:</p>
                    <p className="text-right">Half Cow</p>
                </div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Date Killed:</p>
                    <p className="text-right">01-01-0001</p>
                </div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Live Weight:</p>
                    <p className="text-right">1200lbs</p>
                </div>
                <div className="flex flex-row pl-2 pr-4">
                    <p className="font-semibold flex-grow">Dress Weight:</p>
                    <p className="text-right">600lbs</p>
                </div>
            </div>
        </div>

        <table className="table-fixed bg-gray-300 mt-4 border rounded-md">
            <thead className="bg-gray-800 rounded-md">
                <tr className="rounded-md">
                    <th className="w-1/6 text-left font-semibold text-gray-200 p-2 rounded-tl-md">Part</th>
                    <th className="w-1/4 text-left font-semibold text-gray-200 p-2">Instructions Given</th>
                    <th className="w-14 text-left font-semibold text-gray-200 p-2">Weight</th>
                    <th className="w-1/4 text-left font-semibold text-gray-200 p-2">Charges Associated</th>
                    <th className="w-14 text-left font-semibold text-gray-200 p-2 rounded-tr-md">Total Charge</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Round</td>
                    <td>25% Tenderized 1" 1/pkg</td>
                    <td>25lbs</td>
                    <td>tenderized $3/lb</td>
                    <td>$75</td>
                </tr>
                <tr>
                    <td>Sirloin Tip</td>
                    <td>1" 1/pkg</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Flank</td>
                    <td>Chicken Fry</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Sirloin</td>
                    <td>1/2" 2/pkg</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>T-Bone</td>
                    <td>1/2" 1/pkg</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Rump</td>
                    <td>2lb Roast</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Round</td>
                    <td>25% Tenderized 1" 1/pkg</td>
                    <td>25lbs</td>
                    <td>tenderized $3/lb</td>
                    <td>$75</td>
                </tr>
                <tr>
                    <td>Pikes Peak</td>
                    <td>4lb</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Ground Beef</td>
                    <td>Half 1lb Half 2lb</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Patties</td>
                    <td>25% 3/pkg</td>
                    <td>25lbs</td>
                    <td>patties $0.45/lb</td>
                    <td>$11.25</td>
                </tr>
                <tr>
                    <td>Chuck</td>
                    <td>2lb</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Arm</td>
                    <td>2lb</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Ribs</td>
                    <td>Keep All</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Club</td>
                    <td>Ribeye 1/2" 1/pkg</td>
                    <td>25lbs</td>
                    <td>extra boning?</td>
                    <td>$??</td>
                </tr>
                <tr>
                    <td>Brisket</td>
                    <td>Whole</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Stew Meat</td>
                    <td>5pkgs 1lb/pkg</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
                <tr>
                    <td>Soup Bones</td>
                    <td>Yes</td>
                    <td>---</td>
                    <td>---</td>
                    <td>$0</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  )
}