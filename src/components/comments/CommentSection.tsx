'use client';

import { useState, useMemo } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { postComment } from '@/actions/comments';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import CommentItem from './CommentItem';
import Link from 'next/link';

interface CommentSectionProps {
    instrumentId: string;
    currentUser: any;
    comments: any[];
}

export default function CommentSection({ instrumentId, currentUser, comments }: CommentSectionProps) {
    const router = useRouter();
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // Turn flat list into tree
    const commentTree = useMemo(() => {
        const map = new Map();
        const roots: any[] = [];

        // 1. Initialize map
        comments.forEach(c => {
            map.set(c._id, { ...c, replies: [] });
        });

        // 2. Link children to parents
        comments.forEach(c => {
            const node = map.get(c._id);
            if (c.parentId && map.has(c.parentId)) {
                map.get(c.parentId).replies.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }, [comments]);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsPosting(true);
        const result = await postComment(instrumentId, newComment);

        if (result.success) {
            setNewComment('');
            toast.success('Comentario publicado');
            router.refresh(); // Refresh server data
        } else {
            toast.error(result.error);
        }
        setIsPosting(false);
    };

    return (
        <section className="mt-24 border-t border-gray-100 dark:border-gray-800 pt-12" id="comments">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-gray-400" />
                Comunidad ({comments.length})
            </h3>

            {/* Post Input */}
            <div className="mb-10">
                {currentUser ? (
                    <form onSubmit={handlePost} className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={currentUser.isBanned ? "Tu cuenta está silenciada." : "Escribe un comentario o pregunta..."}
                            disabled={currentUser.isBanned || isPosting}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 pr-16 min-h-[100px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all resize-y text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || currentUser.isBanned || isPosting}
                            className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-800 border-dashed">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Inicia sesión para participar en la conversación</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/login" className="text-sm font-bold text-blue-600 hover:underline">Iniciar Sesión</Link>
                            <Link href="/register" className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Registrarse</Link>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="space-y-6">
                {commentTree.length > 0 ? (
                    commentTree.map(root => (
                        <CommentItem
                            key={root._id}
                            comment={root}
                            currentUser={currentUser}
                            replies={root.replies}
                            onReplyPosted={() => router.refresh()}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-400 py-8 italic">Todavía no hay comentarios. ¡Sé el primero!</p>
                )}
            </div>
        </section>
    );
}
