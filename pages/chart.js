import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from 'react';
import Header from './Header';
import Search from './Search';
import Side from './Side';
const { Configuration, OpenAIApi } = require('openai');
import Mindmap from "./components/Mindmap";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Head from "next/head";
import { DataContext } from "./_app";
import { parse } from "../libs/commonParser";
import Camera from '@/public/images/camera.png'
const Chart = () => {
    const ref = useRef(null)
    const [data, setData] = useState('')
    const [open, setOpen] = useState(false);
    const [show, setShow] = useState(false);
    const [load, setLoad] = useState(false)
    const [file, setFile] = useState(false)
    const [select, setSelect] = useState([]);
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const handleClick = async () => {
        if (topic !== '') {
            try {
                setLoad(true)
                setData('');
                const configuration = new Configuration({
                    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
                });
                const openai = new OpenAIApi(configuration);

                const response = await openai.createChatCompletion({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: `Create a mind map for ${topic} without hashtags in markdown format with desc of each topic after adding colon and only 3 childs` }],
                });
                const str = response.data.choices[0].message.content;

                setData(str)
                setLoad(false)
            } catch (error) {
                setLoad(false)

            }
        }
    }
    const handleClick2 = async (topic) => {
        try {
            const configuration = new Configuration({
                apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            });
            const openai = new OpenAIApi(configuration);

            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `Create a mind map for ${topic} without hashtags in markdown format with desc of each topic after adding colon and only 3 childs` }],
            });
            const str = response.data.choices[0].message.content;
            return str
        } catch (error) {
        }
    }
    const mind = {
        // version: 1,
        meta: {
            name: "demo",
            author: "hizzgdev@163.com",
            version: "0.2",
        },
        format: "node_array",
        data: [],
    };
    const options = {
        container: "jsmind_container",
        theme: "clouds",
        editable: true,
        support_html: true,
        view: {
            draggable: true /* это для того чтоб если увеличить мап то его можно было переместить целиком */,
            nodes_draggable: true /* это для того чтоб если увеличить мап то его можно было переместить целиком */,
            hide_scrollbars_when_draggable: false,
            hmargin: 100,
            vmargin: 50,
        },
        layout: {
            hspace: 120,
            vspace: 20,
            pspace: 13
        }
    };
    const opt = [
        {
            text: "Ask AI about the selected card",
            onclick: "",
        },
        {
            text: "Help me to brainstorm the selected card",
            onclick: "",
        },
        {
            text: "Help me to understand the selected card",
            onclick: "",
        },

        {
            text: "Add the card with the text in input",
            onclick: "card",
            check: true
        },
    ];
    const { showMap, markdown, setMarkdown, setShowMap } =
        useContext(DataContext);
    const click = async (t = '') => {
        setLoading(true)
        let prompt = select[2];
        let parentid = select[1];
        const left = select[0] === 'left';
        if (!t.length) {
            const newString = await handleClick2(prompt);
            let generatedData = parse(newString, markdown.filter(i => i.id === 'root')[0].topic, !left);
            let newData = generatedData.map((i) => {
                if (i.parentid === "root") {
                    if (parentid === "root") {
                        return {
                            ...i,
                            parentid: parentid,
                            direction: select[0],
                            left
                        };
                    } else {
                        return {
                            ...i,
                            parentid: parentid,
                            left
                        };
                    }
                } else {
                    return {
                        ...i,
                        left
                    };
                }
            });
            setShowMap(false)
            let d = [...markdown.filter(
                (i) => i.id !== "root"
            ), ...newData.map(i => ({ ...i, distance: 'left' }))];

            setMarkdown(d);

        } else {
            setShowMap(false)
            setMarkdown((pre) => [
                ...pre,
                {
                    id: inputText.toLowerCase() + "_" + uuidv4(),
                    parentid,
                    text: inputText.replace(
                        inputText.charAt(0),
                        inputText.charAt(0).toUpperCase()
                    ),
                    direction: select[0],
                    left,
                    topic: file? `<img src="${URL.createObjectURL(file)}" alt="" width="100px" height="100px" style="
    
    max-width: 100px;
    pointer-events: none;
    max-height: 100px;

">`+ inputText.replace(
                        inputText.charAt(0),
                        inputText.charAt(0).toUpperCase()
                        ) : inputText.replace(
                            inputText.charAt(0),
                            inputText.charAt(0).toUpperCase()
                        ), // .replace(title.charAt(0), title.charAt(0).toUpperCase()),
                    
                },
            ]);

        }
        setInputText('')
        setLoading(false)
        setFile(false)
        setSelect([])
    }

    useEffect(() => {
        if (select.length) {
            setShow(true)
        } else {
            setShow(false)
        }
    }, [select]);

    return (
        <>
            <div className='flex'>
                <Side />
                <div className='w-[80%] relative flex flex-col'>
                    <Header />

                    <div className='flex flex-col relative z-10 justify-between '>
                        <div className='flex self-end bg-white rounded-bl-xl shadow-[1px_7px_8px_black] absolute px-[16px_35px] pt-[2px]'>

                            <div className="relative" data-te-dropdown-ref >
                                <button
                                    className="flex items-center whitespace-nowrap rounded bg-transparent px-6 pb-2 pt-2.5 text-[16px] font-bold  leading-normal text-black  "
                                    onClick={() => setOpen(!open)}>
                                    Mindmap
                                    <span className="ml-4 w-2">
                                        <Image src="/images/arrow.svg" width={9} height={6} alt='' />
                                    </span>
                                </button>

                                {open && <ul
                                    className="relative z-[1000] float-center m-0  min-w-max list-none overflow-hidden rounded-lg border-none text-black bg-white bg-clip-padding text-left text-base shadow-lg dark:bg-neutral-700 [&[data-te-dropdown-show]]:block"
                                    aria-labelledby="dropdownMenuButton1"
                                    data-te-dropdown-menu-ref>
                                    <li>
                                        <Link
                                            className="block text-center w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 active:no-underline disabled:pointer-events-none disabled:bg-transparent disabled:text-neutral-400 dark:text-neutral-200 dark:hover:bg-neutral-600"
                                            href="/project"
                                            data-te-dropdown-item-ref
                                        >Trello</Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="block text-center w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 active:no-underline disabled:pointer-events-none disabled:bg-transparent disabled:text-neutral-400 dark:text-neutral-200 dark:hover:bg-neutral-600"
                                            href="/chart"
                                            data-te-dropdown-item-ref
                                        >MindMap</Link>
                                    </li>

                                </ul>
                                }
                            </div>

                        </div>
                        {/*<div className='flex flex-col justify-center items-center  '>
                            <div className='flex items-center gap-x-4 mb-6'>
                                <div>
                                    <Image src="/images/Profile.svg" width={50} height={50} alt='' />
                                </div>
                                <div className='text-[16px] text-[#625BF7] font-bold'>Corem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.</div>
                            </div>
                            <div className='bg-[#03003D] mb-6 py-[34px] gap-y-28 px-[50px] rounded-[10px] items-center flex flex-col justify-center'>
                                <div className='flex justify-around gap-x-[250px] '>
                                    <div className='bg-[#46F7B7] rounded-[10px] p-[20px]'>
                                        <p className='text-center'>Worem ipsum dolor sit <br />
                                            amet, consectetur <br />
                                            adipiscing elit.</p>
                                    </div>
                                    <div className='bg-[#1B3CE9] rounded-[10px] p-[20px]'>
                                        <p className='text-center'>Worem ipsum dolor sit <br />
                                            amet, consectetur <br />
                                            adipiscing elit.</p>
                                    </div>
                                </div>
                                <div className='flex justify-around gap-x-[250px] '>
                                    <div className='bg-[#FFA775] rounded-[10px] p-[20px]'>
                                        <p className='text-center'>Worem ipsum dolor sit <br />
                                            amet, consectetur <br />
                                            adipiscing elit.</p>
                                    </div>
                                    <div className='bg-[#CC0707] rounded-[10px] p-[20px]'>
                                        <p className='text-center'>Worem ipsum dolor sit <br />
                                            amet, consectetur <br />
                                            adipiscing elit.</p>
                                    </div>
                                </div>
                            </div>
                            </div>*/}

                    </div>

                    {
                        data && !load ?
                            <>
                                <Mindmap select={select} setSelect={setSelect} options={options} showMap={true} mind={mind} data={data} topic={topic} />
                                {show && (
                                    <div className={`bg-white p-4 shadow-[1px_4px_8px_black] rounded flex flex-col gap-5 absolute max-w-[450px] min-h-[300px] w-full z-10`} style={{ top: '30vh', left: '20vw' }}>
                                        
                                        <div className='relative justify-between flex'><div className="absolute z-50 text-white text-xl font-bold rounded-full bg-red-500 w-10 h-10 flex items-center justify-center cursor-pointer" style={{ top: '-25px', right: '-30px' }} onClick={() => {

                                            setInputText('')
                                            setFile(false)
                                            setLoading(false)
                                            setSelect([])
                                        }}>x</div>
                                            <textarea
                                                rows="1"
                                                placeholder="Let AI map out your ideas!"
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                className="w-[90%] bg-[#201F21] rounded px-4 py-2 text-white placeholder:text-white font-bold text-2xl border-none outline-none hover:border-none hover:outline-none h-[45px]"
                                            />
                                            <input type="file" onChange={(e) => setFile(e.target.files[0])} ref={ref} className="hidden" />
                                            <Image src={Camera.src} className="w-[10%] cursor-pointer" alt='' width={20} height={20} onClick={() => ref.current.click()} />
                                        </div>
                                        {file && <>
                                            <div className="flex items-center justify-center">
                                                <Image src={URL.createObjectURL(file)} className="max-w-[200px] max-h-[200px]" alt='' width={200} height={200} />
                                            </div></>}
                                        <div className="w-full flex justify-center flex-col gap-2 h-[200px] bg-[#201F20] text-white rounded font-[650] text-xl">
                                            {opt.map((i, idx) => (
                                                <div onClick={() => {
                                                    if (!i.check && !loading ? true : inputText.length && !loading) click(i.onclick)
                                                }} key={idx} className={`hover:bg-[#443E5E] px-2 pl-4 rounded py-2 ${(!i.check && !loading ? true : inputText.length && !loading) ? 'cursor-pointer ' : 'cursor-not-allowed'}`}>
                                                    {i.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                            : <div
                                style={{
                                    width: "100%",
                                    height: "85%",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.4rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>{!load && !data ? 'Enter Topic In the Input 🤔' : 'Loading...'}</div>
                    }
                    <div className='bg-white  w-full mb-4  z-10'>
                        <Search topic={topic} load={load} setTopic={setTopic} handleClick={handleClick} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Chart;