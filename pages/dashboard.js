import { auth, db } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { async } from "@firebase/util";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@firebase/firestore";
import Message from "@/components/message";
import { BsTrash2Fill } from "react-icons/bs";
import { AiFillEdit } from "react-icons/ai";
import Link from "next/link";

export default function Dashboard() {
  const route = useRouter();
  const [user, loading] = useAuthState(auth);
  const [posts, setPosts] = useState([]);

  const getData = async () => {
    if (loading) return;
    if (!user) route.push("/auth/login");
    const collectionRef = collection(db, "posts");
    const q = query(
      collectionRef,
      orderBy("createdAt", "desc"),
      // fix this FirebaseError: Function where() called with invalid data. Unsupported field value: undefined (found in field user in query)

      where("user", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    return unsubscribe;
  };

  // Delete Post
  const deletePost = async (id) => {
    const docRef = doc(db, "posts", id);
    await deleteDoc(docRef);
  };

  useEffect(() => {
    if (!route.isReady) return;
    getData();
  }, [user, loading]);

  return (
    <div>
      <h1 className="text-xl">Hello</h1>
      <h1>Your posts</h1>
      <div className="py-2">
        {posts.map((post) => {
          return (
            <Message {...post} key={post.id}>
              <div className="flex gap-4">
                <button
                  onClick={() => deletePost(post.id)}
                  className="text-pink-600 flex justify-center gap-2 py-2 text-sm"
                >
                  <BsTrash2Fill />
                  Delete
                </button>
                <Link href={{ pathname: "/post", query: post }}>
                  <button className="text-cyan-600 flex justify-center gap-2 py-2 text-sm">
                    <AiFillEdit />
                    Edit
                  </button>
                </Link>
              </div>
            </Message>
          );
        })}
      </div>
      <button
        className="font-medium text-white bg-gray-800 py-2 px-4 my-6"
        onClick={() => auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  );
}
