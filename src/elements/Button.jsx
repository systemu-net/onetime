const Button = ({ loading }) => {
  return (
    <div className='h-45 bg-indigo-200 rounded hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer'>
      <button className="h-45 bg-indigo-300 hover:bg-accent text-primary hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 font-bold py-2 px-4 rounded cursor-pointer"
        disabled={loading}
      >
        {loading ? 'Shortening...' : 'Shorten It!'}
      </button>
    </div>
  )
}

export default Button;