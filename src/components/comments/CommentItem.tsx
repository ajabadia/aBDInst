'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Flag, Trash2, Ban, MessageCircle, MoreVertical, X, CornerDownRight } from 'lucide-react';
import { reportComment, deleteOwnComment, moderateComment, banUser, postComment } from '@/actions/comments';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CommentItemProps {
    comment: any;
    currentUser: any;
    replies: any[];
    onReplyPosted: () => void;
    depth?: number;
}

export default function CommentItem({ comment, currentUser, replies, onReplyPosted, depth = 0 }: CommentItemProps) {
    const router = useRouter();
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const isAdmin = currentUser?.role === 'admin';
    const isOwner = currentUser?.id === comment.userId._id;
    const isVisible = comment.status === 'visible';

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        const result = await postComment(comment.instrumentId, replyContent, comment._id);
        if (result.success) {
            toast.success('Respuesta publicada');
            setReplyContent('');
            setIsReplying(false);
            onReplyPosted();
        } else {
            toast.error(result.error);
        }
    };

    const handleReport = async () => {
        const reason = prompt("Describe el motivo del reporte:"); // Simple prompt for now
        if (reason) {
            const result = await reportComment(comment._id, reason);
            if (result.success) toast.success('Reporte enviado');
            else toast.error(result.error);
        }
        setIsReporting(false);
    };

    const handleBan = async () => {
        if (!confirm(`¿Seguro que quieres banear a ${comment.userId.name}? Esto ocultará sus comentarios.`)) return;
        const result = await banUser(comment.userId._id);
        if (result.success) {
            toast.success('Usuario baneado');
            router.refresh();
        } else toast.error(result.error);
    };

    const handleDelete = async () => {
        if (!confirm("¿Borrar comentario?")) return;

        let result;
        if (isAdmin) result = await moderateComment(comment._id, 'delete');
        else result = await deleteOwnComment(comment._id);

        if (result.success) {
            toast.success('Comentario borrado');
            router.refresh();
        } else toast.error(result.error);
    };

    const handleToggleVisibility = async () => {
        const newStatus = isVisible ? 'hidden' : 'visible';
        const result = await moderateComment(comment._id, newStatus);
        if (result.success) {
            toast.success(`Comentario ${isVisible ? 'oculto' : 'visible'}`);
            router.refresh();
        }
    };

    if (!isVisible && !isAdmin) return null; // Should be handled by parent/backend usually but double check

    return (
        <div className={`group mb-4 ${depth > 0 ? 'ml-0 md:ml-6 mt-3' : ''}`}>
            <div className={`flex gap-3 p-4 rounded-2xl border transition-colors ${!isVisible ? 'bg-red-50/50 border-red-100 opacity-75' : 'bg-gray-50/50 dark:bg-white/5 border-transparent hover:border-gray-100 dark:hover:border-gray-800'
                }`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-100">
                        {comment.userId.image ? (
                            <Image src={comment.userId.image} alt={comment.userId.name} width={40} height={40} className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-100">
                                {comment.userId.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Link href={`/profile/${comment.userId._id}`} className={`font-semibold text-sm hover:underline ${comment.userId.isBanned ? 'text-red-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                                {comment.userId.name}
                            </Link>
                            {comment.userId.role === 'admin' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold">ADMIN</span>
                            )}
                            <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                            </span>
                        </div>

                        {/* Actions Dropdown / Buttons */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentUser && (
                                <>
                                    <button onClick={() => setIsReplying(!isReplying)} title="Responder" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-blue-500">
                                        <MessageCircle size={14} />
                                    </button>

                                    {!isOwner && (
                                        <button onClick={handleReport} title="Reportar" className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500">
                                            <Flag size={14} />
                                        </button>
                                    )}
                                </>
                            )}

                            {(isOwner || isAdmin) && (
                                <button onClick={handleDelete} title="Borrar" className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-600">
                                    <Trash2 size={14} />
                                </button>
                            )}

                            {isAdmin && (
                                <>
                                    <button onClick={handleToggleVisibility} title={isVisible ? "Ocultar" : "Mostrar"} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-900">
                                        {isVisible ? '👁️' : '🕶️'}
                                    </button>
                                    <button onClick={handleBan} title="Banear Usuario" className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-700">
                                        <Ban size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <form onSubmit={handleReply} className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Escribe una respuesta..."
                                autoFocus
                                className="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" disabled={!replyContent.trim()} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
                                Enviar
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Recursion for replies */}
            {replies.length > 0 && (
                <div className="relative">
                    {/* Thread Line */}
                    <div className="absolute top-0 left-4 md:left-9 w-px h-full bg-gray-200 dark:bg-gray-800 -z-10" />

                    {replies.map(reply => (
                        <div key={reply._id} className="relative">
                            {/* Curve */}
                            <div className="absolute top-8 left-4 md:left-9 w-4 h-px bg-gray-200 dark:bg-gray-800" />
                            <CommentItem
                                comment={reply}
                                currentUser={currentUser}
                                replies={reply.replies || []} // This needs a structure that supports nested replies in the data
                                onReplyPosted={onReplyPosted}
                                depth={depth + 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
