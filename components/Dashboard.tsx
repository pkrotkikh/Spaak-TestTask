import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const DragDropContext = dynamic(() => import('react-beautiful-dnd').then(mod => mod.DragDropContext), { ssr: false });

type Post = {
    id: number;
    title: string;
    content: string;
    stage: string;
};

const stages = ['Fremast', '1. Behandling', '2. Behandling', '3. Behandling', 'Færdig'];

const Dashboard: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/posts-prisma')
            .then((res) => res.json())
            .then((data) => {
                setPosts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination || destination.droppableId === source.droppableId) return;

        const updatedPosts = posts.map((post) =>
            post.id === parseInt(draggableId) ? { ...post, stage: destination.droppableId } : post
        );

        setPosts(updatedPosts);

        // Updating the stage in the database:
        try {
            await fetch(`/api/updateStage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: draggableId, stage: destination.droppableId }),
            });
        } catch (error) {
            console.error('Failed to update stage:', error);
        }
    };

    const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
        userSelect: 'none',
        padding: 10,
        margin: '0 0 10px 0',
        background: isDragging ? '#e0e0e0' : 'white',
        borderRadius: '5px',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        ...draggableStyle,
    });

    if (loading) return <p>Loading...</p>;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>
                {stages.map((stage) => (
                    <Droppable droppableId={stage} key={stage}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                    border: '1px solid lightgray',
                                    borderRadius: '8px',
                                    width: '250px',
                                    minHeight: '400px',
                                    padding: '10px',
                                    backgroundColor: '#f9f9f9',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                }}
                            >
                                <h2 style={{ textAlign: 'center', color: '#333' }}>{stage}</h2>
                                {posts.filter((post) => post.stage === stage)
                                    .map((post, index) => (
                                        <Draggable draggableId={post.id.toString()} index={index} key={post.id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                                                >
                                                    <h4>{post.title}</h4>
                                                    <p>{post.content}</p>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default Dashboard;
