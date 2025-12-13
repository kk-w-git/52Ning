export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">关于博客</h3>
            <p className="text-sm">
              一个简单的博客系统，用于学习和实践 Node.js 全栈开发。
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">快捷链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  首页
                </a>
              </li>
              <li>
                <a
                  href="/create"
                  className="hover:text-white transition-colors"
                >
                  写文章
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">联系方式</h3>
            <p className="text-sm">Email: example@example.com</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} 我的博客. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
