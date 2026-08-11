import { Client } from "@/types/clients";


interface Props{

client: Client;

}


export function ClientCard({
client
}:Props){

return (

<div className="
rounded-xl
border
bg-white
p-5
">


<h2 className="font-semibold">
{client.name}
</h2>


<p className="text-sm text-gray-500">
{client.phone}
</p>


<p className="mt-3">
Visitas: {client.visits}
</p>


<span className="
mt-3
inline-block
rounded-full
bg-gray-100
px-3
py-1
text-sm
">

{client.status}

</span>


</div>

)

}